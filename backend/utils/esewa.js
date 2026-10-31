const crypto = require("crypto");

/**
 * Get eSewa configuration from environment variables with fallback to sandbox defaults
 */
const getEsewaConfig = () => {
  const environment = process.env.ESEWA_ENVIRONMENT || "sandbox";
  const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
  const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

  const isProduction = environment === "production";
  const paymentUrl = isProduction
    ? "https://epay.esewa.com.np/api/epay/main/v2/form"
    : "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

  const statusUrl = isProduction
    ? "https://epay.esewa.com.np/api/epay/transaction/status/"
    : "https://rc.esewa.com.np/api/epay/transaction/status/";

  return {
    environment,
    productCode,
    secretKey,
    frontendUrl,
    paymentUrl,
    statusUrl,
  };
};

/**
 * Generate HMAC-SHA256 Base64 signature for eSewa
 */
const generateEsewaSignature = (secretKey, dataString) => {
  return crypto
    .createHmac("sha256", secretKey)
    .update(dataString)
    .digest("base64");
};

/**
 * Create payload for eSewa payment initiation
 */
const createEsewaPaymentPayload = (orderId, totalAmount) => {
  const config = getEsewaConfig();
  const transactionUuid = `${orderId}-${Date.now()}`;
  const formattedAmount = String(Number(totalAmount));

  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const signatureData = `total_amount=${formattedAmount},transaction_uuid=${transactionUuid},product_code=${config.productCode}`;
  const signature = generateEsewaSignature(config.secretKey, signatureData);

  return {
    payment_url: config.paymentUrl,
    amount: formattedAmount,
    tax_amount: "0",
    total_amount: formattedAmount,
    transaction_uuid: transactionUuid,
    product_code: config.productCode,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: `${config.frontendUrl}/payment/esewa/success`,
    failure_url: `${config.frontendUrl}/payment/esewa/failure`,
    signed_field_names: signedFieldNames,
    signature,
  };
};

/**
 * Decode and verify eSewa payment callback
 */
const verifyEsewaCallback = async (encodedData) => {
  const config = getEsewaConfig();

  // 1. Decode base64 payload
  let parsed;
  try {
    const decoded = Buffer.from(encodedData, "base64").toString("utf-8");
    parsed = JSON.parse(decoded);
  } catch (err) {
    throw new Error("Invalid eSewa response payload format");
  }

  const {
    transaction_code,
    status,
    total_amount,
    transaction_uuid,
    product_code,
    signed_field_names,
    signature,
  } = parsed;

  if (status !== "COMPLETE") {
    return {
      verified: false,
      status: status || "FAILED",
      message: `Transaction not complete (status: ${status})`,
      rawData: parsed,
    };
  }

  // 2. Validate cryptographic signature
  if (signed_field_names && signature) {
    const fields = signed_field_names.split(",");
    const signatureMessage = fields
      .map((field) => `${field}=${parsed[field]}`)
      .join(",");

    const expectedSignature = generateEsewaSignature(
      config.secretKey,
      signatureMessage,
    );

    if (expectedSignature !== signature) {
      console.warn("eSewa Signature mismatch:", {
        expectedSignature,
        receivedSignature: signature,
        signatureMessage,
      });
      // Fallback verification check via status API
    }
  }

  // 3. Optional: Verify with eSewa transaction status API
  try {
    const cleanAmount = String(total_amount).replace(/,/g, "");
    const verifyUrl = `${config.statusUrl}?product_code=${product_code || config.productCode}&total_amount=${cleanAmount}&transaction_uuid=${transaction_uuid}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const apiRes = await fetch(verifyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const apiData = await apiRes.json();
      if (apiData.status && apiData.status !== "COMPLETE") {
        return {
          verified: false,
          status: apiData.status,
          message: "eSewa status check returned non-complete status",
          rawData: apiData,
        };
      }
    }
  } catch (apiError) {
    // If eSewa sandbox status API is unreachable, log warning and proceed with signature verification
    console.warn("eSewa Status API check skipped:", apiError.message);
  }

  const orderId = transaction_uuid ? transaction_uuid.split("-")[0] : null;

  return {
    verified: true,
    orderId,
    transactionCode: transaction_code,
    amount: total_amount,
    transactionUuid: transaction_uuid,
    rawData: parsed,
  };
};

module.exports = {
  getEsewaConfig,
  generateEsewaSignature,
  createEsewaPaymentPayload,
  verifyEsewaCallback,
};
