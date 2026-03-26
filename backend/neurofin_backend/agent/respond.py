# agent/respond.py

import os
import json
import importlib
import boto3
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

load_dotenv()

bp = Blueprint("respond_bp", __name__)

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
NOVA_MODEL = os.getenv("NOVA_MODEL", "amazon.nova-micro-v1:0")

bedrock = boto3.client(
    "bedrock-runtime",
    region_name=AWS_REGION
)

# -----------------------
# Fallback stubs
# -----------------------

def fetch_user_context(uid):
    return {"smoothed": [], "forecast": {}}

def call_risk_agent(uid, ctx):
    return {"error": "risk-agent-not-available"}

# -----------------------
# Nova LLM
# -----------------------

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


# -----------------------
# Lazy loader
# -----------------------

def _ensure_langgraph_agent_loaded():

    global fetch_user_context, call_risk_agent

    try:

        lga = importlib.import_module("langgraph_agent")

        if hasattr(lga, "fetch_user_context"):
            fetch_user_context = lga.fetch_user_context

        if hasattr(lga, "call_risk_agent"):
            call_risk_agent = lga.call_risk_agent

    except Exception:
        pass


# -----------------------
# RAG retriever
# -----------------------

try:
    from rag import retrieve as rag_retrieve
except Exception:
    def rag_retrieve(user_id, k=5):
        return []


# -----------------------
# Endpoint
# -----------------------

@bp.route("/agent/respond", methods=["POST"])
def respond():

    payload = request.json or {}

    user_id = payload.get("user_id")
    question = payload.get("question") or payload.get("input") or payload.get("text")

    if not user_id or not question:
        return jsonify({"error": "missing user_id or question"}), 400

    _ensure_langgraph_agent_loaded()

    # 1️⃣ fetch context
    ctx = fetch_user_context(user_id)

    # 2️⃣ risk agent
    try:
        risk_context = {
            "short_text": question,
            "smoothed_snapshot": ctx.get("smoothed", [])[:5],
            "forecast_summary": ctx.get("forecast", {})
        }

        risk = call_risk_agent(user_id, risk_context)

    except Exception as e:
        risk = {"error": str(e)}

    # 3️⃣ RAG retrieval
    try:
        retrieved = rag_retrieve(user_id, k=5) or []
    except:
        retrieved = []

    retr_texts = [
        f"- {r.get('text')} (meta={r.get('meta')})"
        for r in retrieved
    ]

    retr_context = "\n".join(retr_texts) if retr_texts else "(no retrieval results)"

    # 4️⃣ Prompt
    prompt = f"""
User question: {question}

Retrieved context:
{retr_context}

Smoothed snapshot:
{ctx.get('smoothed', [])[:3]}

Forecast snapshot:
{ctx.get('forecast', {})}

Risk agent output:
{json.dumps(risk, default=str)}

Provide a concise and empathetic financial explanation.
If risk severity is MEDIUM or HIGH include two actionable steps.
"""

    # 5️⃣ Call Nova
    answer = call_llm(prompt)

    return jsonify({
        "answer": answer,
        "risk": risk,
        "retrieved_count": len(retrieved)
    })