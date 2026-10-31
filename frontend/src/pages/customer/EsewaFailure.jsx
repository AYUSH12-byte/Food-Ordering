import { Link } from "react-router-dom";
import { XCircle, ShoppingBag, RotateCcw, Home } from "lucide-react";

const EsewaFailure = () => {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="overflow-hidden rounded-3xl border border-rose-100 bg-white p-8 sm:p-10 shadow-xl shadow-rose-500/5">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 ring-8 ring-rose-50/60">
          <XCircle className="h-10 w-10 text-rose-500" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800 mb-3">
          eSewa Payment Not Completed
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Payment Cancelled
        </h1>

        <p className="mt-3 text-sm text-slate-500 max-w-md mx-auto">
          Your transaction on eSewa was not completed or was cancelled. Don't worry, your order is saved under your account and you can pay again or choose Cash on Delivery.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition"
          >
            <ShoppingBag className="h-4 w-4" />
            View My Orders
          </Link>

          <Link
            to="/cart"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <RotateCcw className="h-4 w-4 text-slate-500" />
            Return to Cart
          </Link>
        </div>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition"
          >
            <Home className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EsewaFailure;
