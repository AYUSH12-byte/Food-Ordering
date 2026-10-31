import { useEffect, useMemo, useState } from "react";
import { Search, RotateCcw, CreditCard, Eye, CheckCircle2, XCircle } from "lucide-react";

import {
  getAllPayments,
  markPaymentAsPaid,
  markPaymentAsFailed,
} from "../../services/paymentService";
import PaymentDetailsModal from "../../components/admin/PaymentDetailsModal";
import Badge from "../../components/ui/Badge";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";

const Payments = () => {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllPayments();
      setPayments(response.payments || []);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load payments";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return payments.filter((payment) => {
      const matchesSearch =
        !searchValue ||
        payment._id.toLowerCase().includes(searchValue) ||
        payment.user?.name?.toLowerCase().includes(searchValue) ||
        payment.user?.email?.toLowerCase().includes(searchValue) ||
        payment.order?._id?.toLowerCase().includes(searchValue);

      const matchesStatus =
        !statusFilter || payment.paymentStatus === statusFilter;
      const matchesMethod =
        !methodFilter || payment.paymentMethod === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  const handleMarkPaid = async (payment) => {
    if (window.confirm("Mark this payment as paid?")) {
      try {
        setUpdatingId(payment._id);
        setError("");
        await markPaymentAsPaid(payment._id);
        toast.success("Payment marked as paid!");
        await fetchPayments();

        setSelectedPayment((current) => {
          if (!current || current._id !== payment._id) return current;
          return {
            ...current,
            paymentStatus: "Paid",
            paymentDate: new Date().toISOString(),
          };
        });
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to update payment";
        setError(msg);
        toast.error(msg);
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const handleMarkFailed = async (payment) => {
    if (window.confirm("Mark this payment as failed?")) {
      try {
        setUpdatingId(payment._id);
        setError("");
        await markPaymentAsFailed(payment._id);
        toast.warning("Payment marked as failed");
        await fetchPayments();

        setSelectedPayment((current) => {
          if (!current || current._id !== payment._id) return current;
          return {
            ...current,
            paymentStatus: "Failed",
          };
        });
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to update payment";
        setError(msg);
        toast.error(msg);
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setMethodFilter("");
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200/80 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 border border-orange-200/80 mb-2">
            <CreditCard className="h-3.5 w-3.5" />
            <span>Financial Transactions</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Payment Audit Log
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Monitor incoming revenue, cash on delivery settlements, and payment verifications.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <label className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">Search</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Payment ID, order or name..."
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">Payment Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">Method</label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
              >
                <option value="">All Methods</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="eSewa">eSewa</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium pt-1">
            Showing <strong className="text-slate-900 font-bold">{filteredPayments.length}</strong> of {payments.length} payment records
          </p>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          {loading ? (
            <SkeletonTable rows={6} cols={6} />
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center max-w-md mx-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 mx-auto mb-3">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No payment logs found</h3>
              <p className="mt-1 text-xs text-slate-500">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Payment ID</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-mono">
                        <p className="font-bold text-slate-900">#{payment._id.slice(-6).toUpperCase()}</p>
                        <p className="text-[11px] text-slate-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 text-sm">{payment.user?.name || "Customer"}</p>
                        <p className="text-[11px] text-slate-500">{payment.user?.email || "N/A"}</p>
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-600">
                        #{payment.order?._id?.slice(-6).toUpperCase() || "N/A"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-extrabold text-orange-600 text-sm">
                          Rs. {Number(payment.amount).toFixed(2)}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {payment.paymentMethod === "eSewa" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">
                            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#60bb46] text-[9px] font-black text-white">
                              e
                            </span>
                            eSewa
                          </span>
                        ) : (
                          payment.paymentMethod
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <Badge>{payment.paymentStatus}</Badge>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {payment.paymentStatus === "Pending" && (
                            <>
                              <button
                                type="button"
                                disabled={updatingId === payment._id}
                                onClick={() => handleMarkPaid(payment)}
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-40"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Mark Paid
                              </button>
                              <button
                                type="button"
                                disabled={updatingId === payment._id}
                                onClick={() => handleMarkFailed(payment)}
                                className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition disabled:opacity-40"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Fail
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedPayment(payment)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5" /> Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </>
  );
};

export default Payments;
