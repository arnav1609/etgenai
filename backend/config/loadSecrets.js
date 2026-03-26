import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";

const SSM_PATH = "/neurofin/";
const REGION = "ap-south-1";

/**
 * Loads all parameters from AWS Parameter Store under /neurofin/
 * and assigns them to process.env.
 *
 * Falls back to dotenv if AWS is unreachable (e.g. local development).
 */
export async function loadSecrets() {
  try {
    const client = new SSMClient({ region: REGION });
    let nextToken;
    let count = 0;

    do {
      const command = new GetParametersByPathCommand({
        Path: SSM_PATH,
        Recursive: true,
        WithDecryption: true,
        NextToken: nextToken,
      });

      const response = await client.send(command);

      for (const param of response.Parameters || []) {
        // /neurofin/JWT_SECRET        → JWT_SECRET
        // /neurofin/SETU/SETU_CLIENT_ID → SETU_CLIENT_ID
        const key = param.Name.split("/").pop();
        process.env[key] = param.Value;
        count++;
      }

      nextToken = response.NextToken;
    } while (nextToken);

    console.log(`✅ Loaded ${count} secrets from AWS Parameter Store`);
  } catch (err) {
    console.warn(
      `⚠️  Could not load secrets from AWS Parameter Store: ${err.message}`
    );
    console.warn("   Falling back to .env file for local development...");

    // Dynamic import so dotenv is only required when SSM is unavailable
    const { default: dotenv } = await import("dotenv");
    const { default: path } = await import("path");
    const { fileURLToPath } = await import("url");

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    dotenv.config({ path: path.join(__dirname, "..", ".env"), override: true });
    console.log("✅ Loaded environment variables from .env");
  }
}
