import os
import json
import boto3
from dotenv import load_dotenv

# -------------------------------------------------------
# LOAD ENV VARIABLES
# -------------------------------------------------------

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
NOVA_MODEL = os.getenv("NOVA_MODEL", "amazon.nova-micro-v1:0")

# -------------------------------------------------------
# BEDROCK CLIENT
# -------------------------------------------------------

bedrock = boto3.client(
    "bedrock-runtime",
    region_name=AWS_REGION
)

# -------------------------------------------------------
# SYSTEM INSTRUCTIONS (embedded in prompt)
# -------------------------------------------------------

SYSTEM_INSTRUCTIONS = """
You are an expert financial AI assistant.

Your responses must be:
- clear
- structured
- thoughtful
- professional
- analytical

Guidelines:
1. Carefully reason about the question before answering.
2. Avoid vague or generic statements.
3. Provide practical insights when relevant.

Response Format:

Summary
A short overview.

Key Insights
Bullet points with important points.

Detailed Explanation
Explain reasoning step-by-step.

Practical Takeaway
Provide actionable advice if applicable.
"""

# -------------------------------------------------------
# PROMPT BUILDER
# -------------------------------------------------------

def build_prompt(question: str, context: str = None):

    context_section = context if context else "No additional financial data available."

    prompt = f"""
{SYSTEM_INSTRUCTIONS}

User Question:
{question}

Available Context Data:
{context_section}

Instructions:
Think carefully about the problem before answering.
Provide a structured response following the required format.
"""

    return prompt


# -------------------------------------------------------
# AMAZON NOVA CALL
# -------------------------------------------------------

def nova_llm(prompt: str):

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
            "maxTokens": 600,
            "temperature": 0.35,
            "topP": 0.9
        }
    }

    try:

        response = bedrock.invoke_model(
            modelId=NOVA_MODEL,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json"
        )

        result = json.loads(response["body"].read())

        return result["output"]["message"]["content"][0]["text"]

    except Exception as e:
        return f"[Nova Error] {str(e)}"


# -------------------------------------------------------
# OPTIONAL REFINEMENT PASS
# -------------------------------------------------------

def refine_response(initial_response: str):

    refine_prompt = f"""
Improve the clarity and professionalism of the following response.

Ensure it remains structured using:

Summary
Key Insights
Detailed Explanation
Practical Takeaway

Text:
{initial_response}
"""

    return nova_llm(refine_prompt)


# -------------------------------------------------------
# UNIVERSAL ENTRY FUNCTION
# -------------------------------------------------------

def call_llm(question: str, context: str = None, refine: bool = False):

    prompt = build_prompt(question, context)

    response = nova_llm(prompt)

    if refine:
        response = refine_response(response)

    return response


# -------------------------------------------------------
# TEST RUN
# -------------------------------------------------------

if __name__ == "__main__":

    question = "How does inflation affect long-term savings?"

    result = call_llm(question, refine=True)

    print("\nAI RESPONSE:\n")
    print(result)