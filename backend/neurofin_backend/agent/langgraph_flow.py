print("🔥 Flask is starting langgraph_flow.py ...", flush=True)

import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
import requests
import re
import boto3

from respond import bp as respond_bp
from rag import retrieve as rag_retrieve

# --- logging ---
logger = logging.getLogger("langgraph_agent")
logging.basicConfig(level=logging.INFO)

# --- Flask app ---
app = Flask("langgraph_agent")
app.register_blueprint(respond_bp)

# --- config ---
API_BASE = os.environ.get("NEUROFIN_API", "http://api:4000")
RISK_AGENT_URL = os.environ.get("RISK_AGENT_URL", "http://risk:7000/agent/risk/check")

AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
NOVA_MODEL = os.environ.get("NOVA_MODEL", "amazon.nova-micro-v1:0")

# --- Bedrock client ---
bedrock = boto3.client(
    "bedrock-runtime",
    region_name=AWS_REGION
)

# --- LangGraph ---
from langgraph.graph import StateGraph, START, END
from langgraph.graph import MessagesState

# -------------------------------------------------------
# UTILITIES
# -------------------------------------------------------

def extract_json_from_text(text):
    matches = list(re.finditer(r"(\{[\s\S]*\})", text))
    if not matches:
        return None
    for m in reversed(matches):
        try:
            return json.loads(m.group(1))
        except:
            continue
    return None

# -------------------------------------------------------
# GRAPH NODES
# -------------------------------------------------------

def fetch_transactions(state: MessagesState):

    user_id = state.context.get("user_id")

    url = f"{API_BASE}/api/v1/transactions/{user_id}?limit=200"

    try:
        r = requests.get(url, timeout=8)
        txs = r.json()
    except:
        txs = []

    state.context["transactions"] = txs
    return {"ok": True}


def call_kalman_smoother(state: MessagesState):

    user_id = state.context.get("user_id")

    url = f"{API_BASE}/api/v1/smoothed/{user_id}?limit=30"

    try:
        r = requests.get(url, timeout=8)
        smoothed = r.json()
    except:
        smoothed = [{"smoothed_balance": 0}]

    state.context["smoothed"] = smoothed

    return {"ok": True}


def build_llm_prompt(state: MessagesState):

    txs = state.context.get("transactions", [])
    smoothed = state.context.get("smoothed", [])

    latest_balance = smoothed[0].get("smoothed_balance", "unknown") if smoothed else "unknown"

    recent = txs[-10:] if isinstance(txs, list) else []

    summary_lines = []

    for t in reversed(recent):
        summary_lines.append(
            f"{t.get('timestamp')} | {t.get('direction')} | {t.get('amount')} | {t.get('category')}"
        )

    summary = "\n".join(summary_lines) or "no transactions"

    prompt = f"""
You are NeuroFin — an AI financial coach.

Latest smoothed balance: {latest_balance}

Recent transactions:
{summary}

Give:
1. Risk level (LOW, MEDIUM, HIGH)
2. Two actions to improve finances
3. Alert suggestion

Return JSON ONLY:
{{
"risk":"LOW|MEDIUM|HIGH",
"actions":[{{"action":"","reason":""}}],
"alert":{{"send":true|false,"text":""}}
}}
"""

    state.context["prompt"] = prompt.strip()

    return {"ok": True}


# -------------------------------------------------------
# NOVA LLM NODE
# -------------------------------------------------------

def call_nova_node(state: MessagesState):

    prompt = state.context.get("prompt")

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

        text = data["output"]["message"]["content"][0]["text"]

        parsed = extract_json_from_text(text)

        if parsed is None:
            parsed = {"raw": text}

        state.context["llm_advice"] = parsed

        return {"ok": True}

    except Exception as e:
        logger.exception("Nova failed")
        return {"error": str(e)}


def risk_check_node(state: MessagesState):

    advice = state.context.get("llm_advice")

    payload = {
        "user_id": state.context.get("user_id"),
        "advice": advice
    }

    try:

        r = requests.post(RISK_AGENT_URL, json=payload, timeout=6)

        state.context["risk_check"] = r.json()

    except:

        state.context["risk_check"] = {"ok": False}

    return {"ok": True}


def finalize_node(state: MessagesState):

    result = {
        "user_id": state.context.get("user_id"),
        "timestamp": datetime.utcnow().isoformat(),
        "advice": state.context.get("llm_advice"),
        "risk_check": state.context.get("risk_check"),
        "smoothed": (state.context.get("smoothed") or [])[:3],
    }

    state.context["result"] = result

    return {"ok": True}


# -------------------------------------------------------
# GRAPH
# -------------------------------------------------------

graph = StateGraph(MessagesState)

graph.add_node(fetch_transactions)
graph.add_node(call_kalman_smoother)
graph.add_node(build_llm_prompt)
graph.add_node(call_nova_node)
graph.add_node(risk_check_node)
graph.add_node(finalize_node)

graph.add_edge(START, "fetch_transactions")
graph.add_edge("fetch_transactions", "call_kalman_smoother")
graph.add_edge("call_kalman_smoother", "build_llm_prompt")
graph.add_edge("build_llm_prompt", "call_nova_node")
graph.add_edge("call_nova_node", "risk_check_node")
graph.add_edge("risk_check_node", "finalize_node")
graph.add_edge("finalize_node", END)

graph = graph.compile()

# -------------------------------------------------------
# ROUTES
# -------------------------------------------------------

@app.route("/agent/run", methods=["POST"])
def agent_run():

    body = request.get_json()

    user_id = body.get("user_id")

    state = MessagesState()

    state.messages = [{"role": "user", "content": "start"}]

    state.context = {"user_id": user_id}

    result = graph.invoke(state)

    return jsonify(result)


@app.route("/health")
def health():

    return jsonify({
        "status": "ok",
        "model": NOVA_MODEL
    })


if __name__ == "__main__":

    port = int(os.environ.get("PORT", 6000))

    app.run(host="0.0.0.0", port=port)