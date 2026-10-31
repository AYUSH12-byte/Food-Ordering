import api from "./api";

// GET MY PAYMENTS

export const getMyPayments = async () => {
  const response = await api.get("/payments/my-payments");

  return response.data;
};

// GET SINGLE PAYMENT

export const getPaymentById = async (id) => {
  const response = await api.get(`/payments/${id}`);

  return response.data;
};

// ADMIN - GET ALL PAYMENTS

export const getAllPayments = async () => {
  const response = await api.get("/payments");

  return response.data;
};

// ADMIN - MARK PAYMENT AS PAID

export const markPaymentAsPaid = async (id) => {
  const response = await api.put(`/payments/${id}/paid`);

  return response.data;
};

// ADMIN - MARK PAYMENT AS FAILED

export const markPaymentAsFailed = async (id) => {
  const response = await api.put(`/payments/${id}/failed`);

  return response.data;
};

// ESEWA - INITIATE PAYMENT FOR ORDER

export const initiateEsewaPayment = async (orderId) => {
  const response = await api.post(`/payments/esewa/initiate/${orderId}`);

  return response.data;
};

// ESEWA - VERIFY PAYMENT CALLBACK

export const verifyEsewaPayment = async (data) => {
  const response = await api.post("/payments/esewa/verify", { data });

  return response.data;
};

// ESEWA - HELPER TO POST AUTO-SUBMIT FORM

export const submitEsewaForm = (esewaData) => {
  if (!esewaData) return;

  const form = document.createElement("form");
  form.method = "POST";
  form.action =
    esewaData.payment_url ||
    "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

  const fields = [
    "amount",
    "tax_amount",
    "total_amount",
    "transaction_uuid",
    "product_code",
    "product_service_charge",
    "product_delivery_charge",
    "success_url",
    "failure_url",
    "signed_field_names",
    "signature",
  ];

  fields.forEach((field) => {
    if (esewaData[field] !== undefined && esewaData[field] !== null) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = field;
      input.value = String(esewaData[field]);
      form.appendChild(input);
    }
  });

  document.body.appendChild(form);
  form.submit();
};

