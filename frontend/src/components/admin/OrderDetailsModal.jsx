import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import { User, MapPin, Phone, FileText, ShoppingBag, CreditCard, Calendar } from "lucide-react";

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <Modal
      isOpen={Boolean(order)}
      onClose={onClose}
      title="Order Details"
      subtitle={`ID: #${order._id}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-3 items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
            <Badge>{order.orderStatus}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment:</span>
            <Badge>{order.paymentStatus}</Badge>
          </div>
        </div>

        {/* Customer Info */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
            <User className="h-4 w-4 text-orange-500" /> Customer Details
          </h3>
          <div className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3 border border-slate-100 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Full Name</p>
              <p className="mt-1 font-bold text-slate-900">{order.user?.name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Email Address</p>
              <p className="mt-1 font-bold text-slate-900 break-all">{order.user?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Account Phone</p>
              <p className="mt-1 font-bold text-slate-900">{order.user?.phone || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
            <MapPin className="h-4 w-4 text-orange-500" /> Delivery Address
          </h3>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs space-y-3">
            <div>
              <p className="text-slate-400 font-medium">Address</p>
              <p className="mt-1 font-bold text-slate-900">{order.deliveryAddress}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 font-medium">Contact Phone</p>
                <p className="mt-1 font-bold text-slate-900 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-slate-400" /> {order.deliveryPhone}
                </p>
              </div>
              {order.deliveryNote && (
                <div>
                  <p className="text-slate-400 font-medium">Delivery Note</p>
                  <p className="mt-1 font-semibold text-slate-700">{order.deliveryNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
            <ShoppingBag className="h-4 w-4 text-orange-500" /> Ordered Items ({order.items?.length || 0})
          </h3>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
            {order.items?.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-center gap-4 p-3.5 bg-white hover:bg-slate-50 transition">
                {item.food?.image ? (
                  <img
                    src={item.food.image}
                    alt={item.name}
                    className="h-14 w-14 rounded-lg object-cover border border-slate-100 shrink-0"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] text-slate-400 font-bold">
                    No Image
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.quantity} × Rs. {Number(item.price).toFixed(2)}
                  </p>
                </div>
                <p className="font-extrabold text-slate-900 text-sm">
                  Rs. {Number(item.subtotal).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <div className="rounded-xl bg-slate-900 p-4 text-white text-xs space-y-2">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal</span>
            <span className="font-medium">Rs. {Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Delivery Charge</span>
            <span className="font-medium">Rs. {Number(order.deliveryCharge).toFixed(2)}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-emerald-300">
              <span>Coupon discount ({order.couponCode})</span>
              <span className="font-medium">
                − Rs. {Number(order.discountAmount).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-800 pt-2 text-sm">
            <span className="font-bold">Total Amount</span>
            <span className="text-lg font-extrabold text-orange-400">
              Rs. {Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;
