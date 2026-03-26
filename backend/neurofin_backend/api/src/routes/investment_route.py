from flask import Blueprint, request, jsonify
import os

from agent.agents.investment_agent import investment_agent

bp_investment = Blueprint("investment_api", __name__)


@bp_investment.route("/investment", methods=["POST"])
def run_investment():
    try:
        user_id = (request.json or {}).get("user_id", None)
        result = investment_agent(user_id)
        return jsonify(result), 200
    except Exception as e:
        print("Investment Agent Error:", e)
        return jsonify({"error": str(e)}), 500
