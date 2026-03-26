import axios from "axios";

function getEnv() {
  const {
    SETU_BASE_URL,
    SETU_CLIENT_ID,
    SETU_CLIENT_SECRET,
    SETU_PRODUCT_INSTANCE_ID,
  } = process.env;

  if (!SETU_BASE_URL) throw new Error("Missing SETU_BASE_URL");
  if (!SETU_CLIENT_ID) throw new Error("Missing SETU_CLIENT_ID");
  if (!SETU_CLIENT_SECRET) throw new Error("Missing SETU_CLIENT_SECRET");
  if (!SETU_PRODUCT_INSTANCE_ID) {
    throw new Error("Missing SETU_PRODUCT_INSTANCE_ID");
  }

  return {
    SETU_BASE_URL: SETU_BASE_URL.replace(/\/$/, ""),
    SETU_CLIENT_ID,
    SETU_CLIENT_SECRET,
    SETU_PRODUCT_INSTANCE_ID,
  };
}

export async function setuRequest(method, path, data = null) {
  const {
    SETU_BASE_URL,
    SETU_CLIENT_ID,
    SETU_CLIENT_SECRET,
    SETU_PRODUCT_INSTANCE_ID,
  } = getEnv();

  const url = `${SETU_BASE_URL}${path}`;

  const headers = {
    "x-client-id": SETU_CLIENT_ID,
    "x-client-secret": SETU_CLIENT_SECRET,
    "x-product-instance-id": SETU_PRODUCT_INSTANCE_ID,
  };

  if (data !== null) {
    headers["Content-Type"] = "application/json";
  }

  console.log("➡️ Setu request:", {
    method,
    url,
    headers: {
      "x-client-id": "***present***",
      "x-client-secret": "***present***",
      "x-product-instance-id": "***present***",
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    data,
  });

  try {
    const response = await axios({
      method,
      url,
      headers,
      data,
      timeout: 30000,
      validateStatus: () => true,
    });

    console.log("✅ Setu response status:", response.status);

    if (JSON.stringify(response.data).length < 2000) {
      console.log(
        "✅ Setu response data:",
        JSON.stringify(response.data, null, 2)
      );
    } else {
      console.log("✅ Setu response data: (large payload)");
    }

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }

    if (response.data?.traceId) {
      console.error("❌ Setu traceId:", response.data.traceId);
    }

    const errorMessage =
      response.data?.errorMsg ||
      response.data?.message ||
      JSON.stringify(response.data) ||
      `Setu request failed (${response.status})`;

    throw new Error(errorMessage);
  } catch (err) {
    if (err.code === "ECONNABORTED") {
      throw new Error("Setu request timed out");
    }

    const status = err.response?.status;
    const errorData = err.response?.data;

    if (errorData?.traceId) {
      console.error("❌ Setu traceId:", errorData.traceId);
    }

    console.error("❌ Setu API error status:", status);
    console.error(
      "❌ Setu API error data:",
      JSON.stringify(errorData || err.message, null, 2)
    );

    throw new Error(
      errorData?.errorMsg ||
      errorData?.message ||
      err.message ||
      `Setu request failed (${status || 500})`
    );
  }
}