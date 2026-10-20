import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Phone, FileText, CreditCard, Banknote, ShieldCheck, ArrowLeft, Tag, X } from "lucide-react";

import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { createOrder } from "../../services/orderService";
import {
  getAvailableCoupons,
  validateCoupon,
} from "../../services/couponService";
import Button from "../../components/ui/Button";

const Checkout = () => {
  const navigate = useNavigate();
  const { error: showError, success } = useToast();
  const { cart, loading: cartLoading } = useCart();

  const items = cart?.items || [];
  const subtotal = Number(cart?.subtotal || 0);
  const deliveryCharge = items.length > 0 ? 50 : 0;
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [couponsError, setCouponsError] = useState("");
  const discountAmount = Math.min(
    Number(appliedCoupon?.discountAmount || 0),
    subtotal,
  );
  const total = subtotal - discountAmount + deliveryCharge;

  const [formData, setFormData] = useState({
    deliveryAddress: "",
    deliveryPhone: "",
    deliveryNote: "",
    paymentMethod: "Cash on Delivery",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      try {
        setCouponsLoading(true);
        setCouponsError("");
        const response = await getAvailableCoupons();
        setAvailableCoupons(response.coupons);
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to load available coupons";
        setCouponsError(message);
        showError(message);
      } finally {
        setCouponsLoading(false);
      }
    };

    fetchAvailableCoupons();
  }, [showError]);

  const handleApplyCoupon = async (code = couponInput) => {
    setError("");

    if (!code.trim()) {
      setError("Enter a coupon code");
      return;
    }

    try {
      setCouponLoading(true);
      const response = await validateCoupon(code);
      setAppliedCoupon(response.coupon);
      setCouponInput(response.coupon.code);
      success("Coupon applied successfully");
    } catch (err) {
      setAppliedCoupon(null);
      const message =
        err.response?.data?.message || "Failed to validate coupon";
      setError(message);
      showError(message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.deliveryAddress.trim()) {
      setError("Delivery address is required");
      showError("Please enter a delivery address");
      return;
    }

    if (!formData.deliveryPhone.trim()) {
      setError("Delivery phone is required");
      showError("Please enter a contact phone number");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    try {
      setLoading(true);
      const response = await createOrder({
        deliveryAddress: formData.deliveryAddress.trim(),
        deliveryPhone: formData.deliveryPhone.trim(),
        deliveryNote: formData.deliveryNote.trim(),
        paymentMethod: formData.paymentMethod,
        couponCode: appliedCoupon?.code || "",
      });

      success("Order placed successfully!");
      navigate(`/order-success/${response.order._id}`, {
        state: {
          order: response.order,
          payment: response.payment,
          receipt: response.receipt,
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to place order";
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-4 animate-fade-in">
        <div className="animate-shimmer h-8 w-40 rounded-xl bg-slate-200" />
        <div className="animate-shimmer h-48 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-lg">
          <h1 className="text-xl font-bold text-slate-900">Your cart is empty</h1>
          <p className="mt-1 text-xs text-slate-500">Add food items to your cart before proceeding.</p>
          <Link
            to="/foods"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-bold text-white shadow-md"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 border border-orange-200/80 mb-2">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Final Step</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Complete Your Order
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Enter your delivery destination and confirm payment option.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        {/* Form Container */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-500" />
              Delivery Information
            </h2>

            <div className="space-y-4">
              {/* Address */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Delivery Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Street name, house/building number, city, area landmark..."
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    name="deliveryPhone"
                    value={formData.deliveryPhone}
                    onChange={handleChange}
                    placeholder="+977 98XXXXXXXX"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  />
                </div>
              </div>

              {/* Delivery Note */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Delivery Instructions <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    name="deliveryNote"
                    value={formData.deliveryNote}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g. Ring the bell twice or leave at main reception..."
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                  />
                </div>
              </div>

              {/* Payment Option */}
              <div className="pt-2">
                <label className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Payment Method
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label
                    className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition ${
                      formData.paymentMethod === "Cash on Delivery"
                        ? "border-orange-500 bg-orange-50/50 ring-1 ring-orange-500"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={formData.paymentMethod === "Cash on Delivery"}
                      onChange={handleChange}
                      disabled={loading}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex items-center gap-3">
                      <Banknote className="h-6 w-6 text-orange-600" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Cash on Delivery</p>
                        <p className="text-[11px] text-slate-500 font-medium">Pay cash upon food arrival</p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition ${
                      formData.paymentMethod === "Online"
                        ? "border-orange-500 bg-orange-50/50 ring-1 ring-orange-500"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Online"
                      checked={formData.paymentMethod === "Online"}
                      onChange={handleChange}
                      disabled={loading}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Digital / Cards</p>
                        <p className="text-[11px] text-slate-500 font-medium">Online portal simulation</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <label
                  htmlFor="coupon-code"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Discount Coupon
                </label>
                {appliedCoupon ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                      <Tag className="h-4 w-4" />
                      <span>{appliedCoupon.code} applied</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      disabled={loading}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      id="coupon-code"
                      type="text"
                      value={couponInput}
                      onChange={(event) =>
                        setCouponInput(event.target.value.toUpperCase())
                      }
                      placeholder="Enter coupon code"
                      disabled={loading || couponLoading}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm uppercase outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                    <Button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      variant="secondary"
                      loading={couponLoading}
                      disabled={loading || couponLoading}
                    >
                      Apply Code
                    </Button>
                  </div>
                )}

                <div className="mt-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Available Coupons
                  </h3>
                  {couponsLoading ? (
                    <p className="text-xs text-slate-500">
                      Loading available coupons...
                    </p>
                  ) : couponsError ? (
                    <p role="alert" className="text-xs font-medium text-rose-600">
                      {couponsError}
                    </p>
                  ) : availableCoupons.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No coupons are currently available.
                    </p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {availableCoupons.map((coupon) => {
                        const isApplied = appliedCoupon?.code === coupon.code;

                        return (
                          <div
                            key={coupon._id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="min-w-0">
                              <p className="flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
                                <Tag className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                                <span className="truncate">{coupon.code}</span>
                              </p>
                              <p className="mt-1 text-xs font-semibold text-emerald-700">
                                Rs. {Number(coupon.amount).toFixed(2)} off
                              </p>
                              <p className="mt-1 text-[11px] text-slate-500">
                                Expires{" "}
                                {new Date(coupon.expiresAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={loading || couponLoading || isApplied}
                              loading={couponLoading && couponInput === coupon.code}
                              onClick={() => {
                                setCouponInput(coupon.code);
                                handleApplyCoupon(coupon.code);
                              }}
                              className="shrink-0 px-3 py-2 text-xs"
                            >
                              {isApplied ? "Applied" : "Apply"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md space-y-6">
            <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            <div className="space-y-3 max-h-52 overflow-y-auto pr-1 divide-y divide-slate-100">
              {items.map((item) => {
                if (!item.food) return null;
                return (
                  <div key={item.food._id} className="pt-2 flex justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.food.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.quantity} × Rs. {Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      Rs. {(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-bold text-slate-900">Rs. {deliveryCharge.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span className="font-bold">− Rs. {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-3 flex justify-between text-sm">
                <span className="font-extrabold text-slate-900">Total Payable</span>
                <span className="text-xl font-extrabold text-orange-600">Rs. {total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Confirm & Place Order
            </Button>

            <Link
              to="/cart"
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Cart
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
