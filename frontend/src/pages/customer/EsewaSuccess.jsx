import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Receipt as ReceiptIcon,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { verifyEsewaPayment } from "../../services/paymentService";
import { useCart } from "../../context/CartContext";

const EsewaSuccess = () => {
  const [searchParams] = useSearchParams();
  const { fetchCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const hasVerified = useRef(false);

  useEffect(() => {
    const data = searchParams.get("data");

    if (!data) {
      setError("No transaction data received from eSewa.");
      setLoading(false);
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        setLoading(true);
        const res = await verifyEsewaPayment(data);
        setResult(res);
        // Refresh local cart state
        fetchCart();
      } catch (err) {
        console.error("eSewa verification error:", err);
        const message =
          err.response?.data?.message ||
          "Could not verify your eSewa payment. Please check your order history.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams, fetchCart]);

  // Loading State
  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-full border-4 border-emerald-100 border-t-[#60bb46] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-[#60bb46]">
            e
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Verifying eSewa Payment
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md">
          Please wait while we confirm your transaction securely with eSewa servers...
        </p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Verification Issue</h2>
        <p className="mt-2 text-sm text-slate-600 max-w-md">{error}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/orders"
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
          >
            Check My Orders
          </Link>
          <Link
            to="/cart"
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  const order = result?.order;
  const payment = result?.payment;
  const transactionCode = result?.transactionCode || payment?.transactionId || "N/A";
  const receiptId =
    result?.receipt?._id ||
    (typeof order?.receipt === "object" ? order?.receipt?._id : order?.receipt);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white p-8 sm:p-10 shadow-xl shadow-emerald-500/5">
        {/* Header Icon */}
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 ring-8 ring-emerald-50/60 animate-bounce-subtle">
            <CheckCircle2 className="h-10 w-10 text-[#60bb46]" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 mb-3">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#60bb46] text-[10px] font-black text-white">
              e
            </span>
            eSewa Verified Payment
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Payment Completed Successfully!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Thank you! Your payment has been received and your food order is now being processed.
          </p>
        </div>

        {/* Transaction Details Box */}
        <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 font-medium">Order Reference:</span>
            <span className="font-bold text-slate-900">
              #{order?._id ? order._id.slice(-8).toUpperCase() : "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 font-medium">eSewa Transaction Code:</span>
            <span className="font-mono font-bold text-[#60bb46]">
              {transactionCode}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 font-medium">Payment Method:</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
              <span className="inline-block h-2 w-2 rounded-full bg-[#60bb46]" />
              eSewa Wallet
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 font-medium">Payment Status:</span>
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              PAID
            </span>
          </div>

          <div className="border-t border-slate-200/80 pt-3 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Total Amount Paid:</span>
            <span className="text-lg font-extrabold text-[#60bb46]">
              Rs. {Number(order?.totalAmount || payment?.amount || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {order?._id && (
            <Link
              to={`/orders/${order._id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              View Order Details
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}

          {receiptId && (
            <Link
              to={`/receipts/${receiptId}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <ReceiptIcon className="h-4 w-4 text-slate-500" />
              Download Receipt
            </Link>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/foods"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            ← Continue Browsing Menu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EsewaSuccess;
