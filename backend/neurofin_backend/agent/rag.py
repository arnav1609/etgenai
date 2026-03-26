import os
import json
import time
import logging
import boto3

logger = logging.getLogger("rag")

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
EMBED_MODEL = os.getenv("EMBED_MODEL", "amazon.titan-embed-text-v2:0")

bedrock = boto3.client(
    "bedrock-runtime",
    region_name=AWS_REGION
)


def embed_texts(texts, batch_size=8, max_retries=4):

    if not texts:
        return []

    embeddings = []

    for text in texts:

        backoff = 1.0

        for attempt in range(max_retries):

            try:

                body = {
                    "inputText": text
                }

                response = bedrock.invoke_model(
                    modelId=EMBED_MODEL,
                    body=json.dumps(body),
                    contentType="application/json",
                    accept="application/json"
                )

                data = json.loads(response["body"].read())

                embeddings.append(data["embedding"])

                break

            except Exception as e:

                logger.warning(
                    "Embedding failed attempt %d/%d: %s",
                    attempt + 1,
                    max_retries,
                    str(e)
                )

                time.sleep(backoff)
                backoff *= 2

                if attempt == max_retries - 1:
                    raise RuntimeError(f"Embedding failed: {e}")

    return embeddings