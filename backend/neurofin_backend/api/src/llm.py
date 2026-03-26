# api/src/llm.py

import os
import json
import boto3

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
NOVA_MODEL = os.getenv("NOVA_MODEL", "amazon.nova-micro-v1:0")

# Create Bedrock runtime client
bedrock = boto3.client(
    "bedrock-runtime",
    region_name=AWS_REGION
)


def call_llm(prompt: str) -> str:
    """
    Calls Amazon Nova via AWS Bedrock.
    Returns the assistant response text.
    """

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
            "maxTokens": 300,
            "temperature": 0.3
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

        return f"❌ Nova request failed: {str(e)}"