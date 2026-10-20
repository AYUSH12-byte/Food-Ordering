import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ArrowRight, Clock, RotateCcw, Sparkles } from "lucide-react";

import { getMyOrders, reorderOrder } from "../../services/orderService";
import Badge from "../../components/ui/Badge";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";

const Orders = () => {
  const { error: showError, success, warning } = useToast();
  const { fetchCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reorderingId, setReorderingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMyOrders();
      setOrders(response.orders || []);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load order history";
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleReorder = async (order) => {
    try {
      setReorderingId(order._id);
      const response = await reorderOrder(order._id);
      await fetchCart();

      if (response.addedItems.length > 0) {
        const itemCount = response.addedItems.reduce(
          (count, item) => count + item.quantity,
          0,
        );
        success(`${itemCount} item(s) added to your cart`);
      } else {
        warning("None of the items in this order are currently available");
      }

      if (response.skippedItems.length > 0) {
        warning(
          `Unavailable items skipped: ${response.skippedItems
            .map((item) => item.name)
            .join(", ")}`,
          7000,
        );
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to reorder items");
    } finally {
      setReorderingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-4 animate-fade-in">
        <div className="animate-shimmer h-8 w-48 rounded-xl bg-slate-200" />
        <div className="animate-shimmer h-40 rounded-2xl bg-slate-200" />
        <div className="animate-shimmer h-40 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 border border-orange-200/80 mb-2">
          <Package className="h-3.5 w-3.5" />
          <span>My Order History</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Track Your Meals
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          View your order history, delivery details, and receipt invoices.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!error && orders.length === 0 && (
        <div className="my-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-100 text-orange-600 mx-auto mb-4">
            <Package className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">No Orders Placed Yet</h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Discover delicious meals on our menu and place your first order.
          </p>
          <Link
            to="/foods"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-700 transition"
          >
            <Sparkles className="h-4 w-4" />
            Explore Menu Now
          </Link>
        </div>
      )}

      {/* Orders List */}
      {orders.length > 0 && (
        <div className="space-y-5">
          {orders.map((order) => {
            const firstItems = order.items?.slice(0, 2) || [];
            const extraItems = Math.max((order.items?.length || 0) - 2, 0);

            return (
              <div
                key={order._id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Reference</span>
                    <p className="font-mono text-sm font-bold text-slate-900">#{order._id}</p>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge>{order.orderStatus}</Badge>
                    <Badge>{order.paymentStatus}</Badge>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2.5">
                  {firstItems.map((item, index) => (
                    <div key={`${order._id}-${index}`} className="flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        {item.food?.image ? (
                          <img
                            src={item.food.image}
                            alt={item.name}
                            className="h-10 w-10 rounded-lg object-cover border border-slate-100"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[10px] text-slate-400 font-bold">
                            No Img
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-slate-500">{item.quantity} × Rs. {Number(item.price).toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-slate-900">
                        Rs. {Number(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  {extraItems > 0 && (
                    <p className="text-[11px] font-semibold text-slate-400 italic">
                      + {extraItems} additional item{extraItems !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Price</span>
                    <p className="text-lg font-extrabold text-orange-600">
                      Rs. {Number(order.totalAmount).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      disabled={reorderingId !== null}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      {reorderingId === order._id ? "Adding..." : "Reorder"}
                    </button>
                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
                    >
                      View Details <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
