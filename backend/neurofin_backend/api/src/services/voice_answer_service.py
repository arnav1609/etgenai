import os
import json
import boto3
from conversation_memory import get_history, add_to_history


AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
NOVA_MODEL = os.getenv("NOVA_MODEL", "amazon.nova-lite-v1:0")

bedrock = boto3.client(
    "bedrock-runtime",
    region_name=AWS_REGION
)


def generate_voice_answer(user_id, question):

    # 1️⃣ Load conversation memory
    history = get_history(user_id)

    # 2️⃣ Convert memory to Nova message format
    messages = []

    for msg in history:
        messages.append({
            "role": msg["role"],
            "content": [
                {"text": msg["content"]}
            ]
        })

    # add latest user question
    messages.append({
        "role": "user",
        "content": [
            {"text": question}
        ]
    })

    # 3️⃣ Call Amazon Nova
    body = {
        "messages": messages,
        "inferenceConfig": {
            "maxTokens": 300,
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

        answer = data["output"]["message"]["content"][0]["text"]

    except Exception as e:

        answer = f"Nova error: {str(e)}"

    # 4️⃣ Save conversation to memory
    add_to_history(user_id, "user", question)
    add_to_history(user_id, "assistant", answer)

    return {"answer_text": answer}