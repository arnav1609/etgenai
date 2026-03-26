# agent/langgraph_agent.py

import os
import uuid
import requests
import json
import boto3
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from respond import bp as respond_bp

load_dotenv()

API_BASE = os.getenv("NEUROFIN_API", "http://api:4000")
RISK_AGENT_URL = os.getenv("RISK_AGENT_URL", "http://risk:7000/agent/risk/check")

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
NOVA_MODEL = os.getenv("NOVA_MODEL", "amazon.nova-micro-v1:0")

# Bedrock client
bedrock = boto3.client(
    "bedrock-runtime",
    region_name=AWS_REGION
)

app = Flask(__name__)
app.register_blueprint(respond_bp)


# -------------------------------------------------------
# USER CONTEXT
# -------------------------------------------------------

def fetch_user_context(user_id):

    try:
        sm = requests.get(f"{API_BASE}/api/v1/smoothed/{user_id}?limit=10", timeout=5).json()
    except:
        sm = []

    try:
        fc = requests.get(f"{API_BASE}/api/v1/forecast/{user_id}/latest", timeout=5).json()
    except:
        fc = {}

    return {"smoothed": sm, "forecast": fc}


# -------------------------------------------------------
# RISK AGENT
# -------------------------------------------------------

def call_risk_agent(user_id, context):

    payload = {
        "request_id": str(uuid.uuid4()),
        "user_id": user_id,
        "context": context,
        "options": {"explain": True}
    }

    r = requests.post(RISK_AGENT_URL, json=payload, timeout=10)
    r.raise_for_status()

    return r.json()


# -------------------------------------------------------
# NOVA LLM CALL
# -------------------------------------------------------

def call_llm(prompt):

    body = {
        "messages": [
            {
                "role": "user",
                "content": [
                    {"text": prompt}
                ]
            }
        ],
        "inferenceConfig": {
            "maxTokens": 500,
            "temperature": 0.4
        }
    }

    try:

        response = bedrock.invoke_model(
            modelId=NOVA_MODEL,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json"
        )

        data = json.loads(response["body"].read())

        return data["output"]["message"]["content"][0]["text"]

    except Exception as e:

        return f"Nova error: {str(e)}"


# -------------------------------------------------------
# AGENT ENDPOINT
# -------------------------------------------------------

@app.route("/agent/respond", methods=["POST"])
def respond():

    payload = request.json

    user_id = payload.get("user_id")
    question = payload.get("question")

    if not user_id or not question:
        return jsonify({"error": "missing user_id or question"}), 400

    # 1️⃣ Gather context
    ctx = fetch_user_context(user_id)

    risk_context = {
        "short_text": question,
        "smoothed_snapshot": ctx["smoothed"][:5],
        "forecast_summary": ctx.get("forecast", {})
    }

    try:
        risk = call_risk_agent(user_id, risk_context)
    except Exception as e:
        risk = {"error": str(e)}

    # 2️⃣ Build prompt
    prompt = f"""
User question: {question}

Context (smoothed sample):
{ctx['smoothed'][:3]}

Forecast summary:
{ctx.get('forecast', {})}

Risk agent output:
{json.dumps(risk, default=str)}

Provide a concise and empathetic financial response.

If risk severity is MEDIUM or HIGH include two actionable steps.
"""

    # 3️⃣ Call Nova
    answer = call_llm(prompt)

    return jsonify({
        "answer": answer,
        "risk": risk
    })


# -------------------------------------------------------
# HEALTH
# -------------------------------------------------------

@app.route("/health")
def health():

    return jsonify({
        "status": "ok",
        "model": NOVA_MODEL
    })


# -------------------------------------------------------
# MAIN
# -------------------------------------------------------

if __name__ == "__main__":

    port = int(os.getenv("PORT", 6000))

    app.run(host="0.0.0.0", port=port)