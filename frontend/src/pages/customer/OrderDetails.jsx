import { useCallback, useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";

import { getOrderById } from "../../services/orderService";

import FeedbackForm from "../../components/customer/FeedbackForm";

const statuses = ["Pending", "Preparing", "Ready", "Delivered"];
const STATUS_REFRESH_INTERVAL = 15000;

const OrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [refreshError, setRefreshError] = useState("");

  const fetchOrder = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
        setError("");
      }

      const response = await getOrderById(id);

      setOrder(response.order);
      setRefreshError("");
    } catch (fetchError) {
      const message =
        fetchError.response?.data?.message || "Failed to load order";

      if (silent) {
        setRefreshError("Unable to refresh order status. Retrying automatically.");
      } else {
        setError(message);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!order || ["Delivered", "Cancelled"].includes(order.orderStatus)) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchOrder({ silent: true });
      }
    }, STATUS_REFRESH_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, [fetchOrder, order]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-52 rounded bg-slate-200" />

          <div className="h-64 rounded-2xl bg-slate-200" />

          <div className="h-48 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {error || "Order not found"}
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

  const currentStatusIndex = statuses.indexOf(order.orderStatus);

  const isCancelled = order.orderStatus === "Cancelled";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <Link
            to="/orders"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to Orders
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Order Details
          </h1>

          <p className="mt-2 break-all text-sm text-slate-500">
            Order ID: {order._id}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
            {order.orderStatus}
          </span>

          <span
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              order.paymentStatus === "Paid"
                ? "bg-green-100 text-green-700"
                : order.paymentStatus === "Failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
            }`}
          >
            Payment: {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Tracking */}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Order Tracking</h2>

          <div className="flex items-center gap-4">
            {!isCancelled && order.orderStatus !== "Delivered" && (
              <span className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 sm:inline-flex">
                <RefreshCw className="h-3.5 w-3.5" />
                Updates every 15 seconds
              </span>
            )}
            <Link
              to="/orders"
              className="hidden text-sm font-semibold text-slate-500 hover:text-slate-900 sm:block"
            >
              All Orders
            </Link>
          </div>
        </div>

        {refreshError && (
          <p role="status" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            {refreshError}
          </p>
        )}

        {isCancelled ? (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">
            This order has been cancelled.
          </div>
        ) : (
          <div className="mt-8">
            <div className="flex items-start justify-between">
              {statuses.map((status, index) => {
                const completed = index <= currentStatusIndex;

                const active = index === currentStatusIndex;

                return (
                  <div
                    key={status}
                    className="relative flex flex-1 flex-col items-center text-center"
                  >
                    {index < statuses.length - 1 && (
                      <div
                        className={`absolute left-1/2 top-4 h-1 w-full ${
                          index < currentStatusIndex
                            ? "bg-slate-900"
                            : "bg-slate-200"
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                        completed
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 bg-white text-slate-400"
                      } ${active ? "ring-4 ring-slate-100" : ""}`}
                    >
                      {completed ? "✓" : index + 1}
                    </div>

                    <p
                      className={`mt-3 text-xs font-semibold ${
                        completed ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {status}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main */}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Items */}

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Ordered Items</h2>

            <div className="mt-6 divide-y divide-slate-200">
              {order.items.map((item, index) => (
                <div
                  key={`${item.food?._id || item.name}-${index}`}
                  className="flex gap-4 py-5 first:pt-0 last:pb-0"
                >
                  {item.food?.image ? (
                    <img
                      src={item.food.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                      No Image
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.quantity} × Rs. {Number(item.price).toFixed(2)}
                        </p>
                      </div>

                      <p className="font-bold text-slate-900">
                        Rs. {Number(item.subtotal).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery */}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Delivery Information
            </h2>

            {order.orderStatus === "Delivered" && (
              <div className="mt-6">
                <FeedbackForm orderId={order._id} onSuccess={fetchOrder} />
              </div>
            )}

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Address
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  {order.deliveryAddress}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  {order.deliveryPhone}
                </p>
              </div>

              {order.deliveryNote && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Note
                  </p>

                  <p className="mt-2 text-sm text-slate-700">
                    {order.deliveryNote}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}

        <div>
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>

                <span className="font-medium">
                  Rs. {Number(order.subtotal).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Delivery</span>

                <span className="font-medium">
                  Rs. {Number(order.deliveryCharge).toFixed(2)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between">
                  <span className="font-bold">Total</span>

                  <span className="text-xl font-bold">
                    Rs. {Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Payment Method
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {order.paymentMethod}
              </p>
            </div>

            {/* Receipt */}

            {order.receipt?._id && (
              <Link
                to={`/receipts/${order.receipt._id}`}
                className="mt-6 block w-full rounded-lg bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
              >
                View Receipt
              </Link>
            )}

            <p className="mt-5 text-center text-xs text-slate-400">
              Ordered on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
