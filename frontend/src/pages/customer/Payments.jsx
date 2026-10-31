import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { getMyPayments } from "../../services/paymentService";

const Payments = () => {
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyPayments();

      setPayments(response.payments || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load payment history",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusClass = (status) => {
    if (status === "Paid") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Failed") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="h-24 rounded-2xl bg-slate-200" />
          <div className="h-24 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}

      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Payment History
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          View your previous payment transactions.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Empty */}

      {!error && payments.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
            💳
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No payment history
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Your payments will appear here after you place an order.
          </p>

          <Link
            to="/foods"
            className="mt-5 inline-block rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Browse Food
          </Link>
        </div>
      )}

      {/* Payments */}

      {payments.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Order
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Method
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50">
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900">
                        #{payment._id.slice(-8)}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      {payment.order?._id ? (
                        <Link
                          to={`/orders/${payment.order._id}`}
                          className="font-semibold text-slate-700 hover:text-slate-900 hover:underline"
                        >
                          #{payment.order._id.slice(-8)}
                        </Link>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900">
                        Rs. {Number(payment.amount).toFixed(2)}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      {payment.paymentMethod === "eSewa" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#60bb46] text-[10px] font-black text-white">
                            e
                          </span>
                          eSewa
                        </span>
                      ) : (
                        <p className="text-sm text-slate-700">
                          {payment.paymentMethod}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          payment.paymentStatus,
                        )}`}
                      >
                        {payment.paymentStatus}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <p className="text-sm text-slate-600">
                        {new Date(payment.createdAt).toLocaleString()}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
