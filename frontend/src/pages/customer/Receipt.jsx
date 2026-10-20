import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { getReceiptById, downloadReceipt } from "../../services/receiptService";

const Receipt = () => {
  const { id } = useParams();

  const [receipt, setReceipt] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [downloading, setDownloading] = useState(false);

  // FETCH RECEIPT

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getReceiptById(id);

      setReceipt(response.receipt);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load receipt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  // DOWNLOAD PDF

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const response = await downloadReceipt(id);

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `${receipt.receiptNumber}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to download receipt");
    } finally {
      setDownloading(false);
    }
  };

  // LOADING

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-slate-200" />

          <div className="h-96 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  // ERROR

  if (error || !receipt) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {error || "Receipt not found"}
          </h1>

          <Link
            to="/orders"
            className="mt-5 inline-block rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const order = receipt.order;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            to="/orders"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to Orders
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">Receipt</h1>

          <p className="mt-2 text-sm text-slate-500">{receipt.receiptNumber}</p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading ? "Downloading..." : "Download PDF"}
        </button>
      </div>

      {/* RECEIPT */}

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Restaurant Header */}

        <div className="border-b border-slate-200 px-6 py-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">RESTAURANT NAME</h2>

          <p className="mt-2 text-sm text-slate-500">
            Online Food Ordering System
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs text-slate-500">
            <span>
              Receipt:{" "}
              <strong className="text-slate-900">
                {receipt.receiptNumber}
              </strong>
            </span>

            <span>•</span>

            <span>{new Date(receipt.generatedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Customer + Delivery */}

        <div className="grid gap-6 border-b border-slate-200 p-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Customer
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {receipt.user?.name}
            </p>

            <p className="mt-1 text-sm text-slate-500">{receipt.user?.email}</p>

            <p className="mt-1 text-sm text-slate-500">{receipt.user?.phone}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Delivery
            </p>

            <p className="mt-2 text-sm text-slate-700">
              {order?.deliveryAddress}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {order?.deliveryPhone}
            </p>

            {order?.deliveryNote && (
              <p className="mt-2 text-sm text-slate-500">
                Note: {order.deliveryNote}
              </p>
            )}
          </div>
        </div>

        {/* Items */}

        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900">Order Items</h3>

          <div className="mt-5 divide-y divide-slate-200">
            {order?.items?.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.quantity} × Rs. {Number(item.price).toFixed(2)}
                  </p>
                </div>

                <p className="font-semibold text-slate-900">
                  Rs. {Number(item.subtotal).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}

        <div className="border-t border-slate-200 bg-slate-50 p-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>

              <span className="font-medium text-slate-900">
                Rs. {Number(order?.subtotal || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Delivery Charge</span>

              <span className="font-medium text-slate-900">
                Rs. {Number(order?.deliveryCharge || 0).toFixed(2)}
              </span>
            </div>

            {Number(order?.discountAmount) > 0 && (
              <div className="flex justify-between text-sm text-emerald-700">
                <span>Coupon discount ({order.couponCode})</span>
                <span className="font-medium">
                  − Rs. {Number(order.discountAmount).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t border-slate-200 pt-4">
              <span className="text-lg font-bold text-slate-900">Total</span>

              <span className="text-xl font-bold text-slate-900">
                Rs.{" "}
                {Number(receipt.amount || order?.totalAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment */}

        <div className="grid gap-4 border-t border-slate-200 p-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Payment Method
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              {receipt.paymentMethod}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Payment Status
            </p>

            <p
              className={`mt-2 text-sm font-semibold ${
                receipt.paymentStatus === "Paid"
                  ? "text-green-600"
                  : receipt.paymentStatus === "Failed"
                    ? "text-red-600"
                    : "text-yellow-600"
              }`}
            >
              {receipt.paymentStatus}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Order Status
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              {order?.orderStatus}
            </p>
          </div>
        </div>

        {/* Footer */}

        <div className="border-t border-slate-200 px-6 py-8 text-center">
          <p className="font-semibold text-slate-900">
            Thank You for Your Order!
          </p>

          <p className="mt-1 text-sm text-slate-500">
            We appreciate your business.
          </p>
        </div>
      </div>

      {/* Bottom actions */}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {downloading ? "Downloading..." : "Download Receipt PDF"}
        </button>

        <Link
          to="/orders"
          className="rounded-lg border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Back to Orders
        </Link>
      </div>
    </div>
  );
};

export default Receipt;
