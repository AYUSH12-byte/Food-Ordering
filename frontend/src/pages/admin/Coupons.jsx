import { useCallback, useEffect, useState } from "react";
import { Plus, Tag, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCouponStatus,
} from "../../services/couponService";

const toLocalDateTimeInput = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const initialForm = () => ({
  code: "",
  amount: "",
  expiresAt: toLocalDateTimeInput(new Date(Date.now() + 86400000)),
  maxUses: "",
});

const Coupons = () => {
  const { error: showError, success } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getCoupons();
      setCoupons(response.coupons);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load coupons";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSaving(true);
      await createCoupon({
        code: form.code.trim().toUpperCase(),
        amount: Number(form.amount),
        expiresAt: new Date(form.expiresAt).toISOString(),
        maxUses: form.maxUses === "" ? null : Number(form.maxUses),
      });
      setForm(initialForm());
      success("Coupon created successfully");
      await fetchCoupons();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to create coupon";
      setError(message);
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon) => {
    try {
      const response = await updateCouponStatus(
        coupon._id,
        !coupon.isActive,
      );
      setCoupons((items) =>
        items.map((item) =>
          item._id === coupon._id ? response.coupon : item,
        ),
      );
      success(
        response.coupon.isActive ? "Coupon activated" : "Coupon deactivated",
      );
    } catch (err) {
      showError(
        err.response?.data?.message || "Failed to update coupon",
      );
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) {
      return;
    }

    try {
      await deleteCoupon(coupon._id);
      setCoupons((items) => items.filter((item) => item._id !== coupon._id));
      success("Coupon deleted");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete coupon");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="border-b border-slate-200/80 pb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
          <Tag className="h-3.5 w-3.5" />
          Promotions
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Coupon Management
        </h1>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Create fixed discounts with an expiry date and optional usage limit.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5"
      >
        <div>
          <label
            htmlFor="coupon-code"
            className="mb-1 block text-xs font-bold uppercase text-slate-600"
          >
            Coupon Code
          </label>
          <input
            id="coupon-code"
            required
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z0-9_-]+"
            value={form.code}
            onChange={(event) =>
              setForm((value) => ({ ...value, code: event.target.value.toUpperCase() }))
            }
            placeholder="SAVE100"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <div>
          <label
            htmlFor="coupon-amount"
            className="mb-1 block text-xs font-bold uppercase text-slate-600"
          >
            Discount (Rs.)
          </label>
          <input
            id="coupon-amount"
            required
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(event) =>
              setForm((value) => ({ ...value, amount: event.target.value }))
            }
            placeholder="100"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <div>
          <label
            htmlFor="coupon-expiry"
            className="mb-1 block text-xs font-bold uppercase text-slate-600"
          >
            Expires At
          </label>
          <input
            id="coupon-expiry"
            required
            type="datetime-local"
            min={toLocalDateTimeInput(new Date())}
            value={form.expiresAt}
            onChange={(event) =>
              setForm((value) => ({ ...value, expiresAt: event.target.value }))
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <div>
          <label
            htmlFor="coupon-limit"
            className="mb-1 block text-xs font-bold uppercase text-slate-600"
          >
            Usage Limit (Optional)
          </label>
          <input
            id="coupon-limit"
            type="number"
            min="1"
            step="1"
            value={form.maxUses}
            onChange={(event) =>
              setForm((value) => ({ ...value, maxUses: event.target.value }))
            }
            placeholder="Unlimited"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="submit"
            loading={saving}
            disabled={saving}
            icon={Plus}
            className="w-full"
          >
            Create Coupon
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <SkeletonTable rows={4} cols={5} />
        ) : coupons.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">
            No coupons yet. Create your first coupon above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Discount</th>
                  <th className="px-5 py-3">Usage</th>
                  <th className="px-5 py-3">Expiry</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiresAt) <= new Date();
                  const isUsable =
                    coupon.isActive &&
                    !isExpired &&
                    (coupon.maxUses === null ||
                      coupon.usedCount < coupon.maxUses);

                  return (
                    <tr key={coupon._id}>
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        {coupon.code}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        Rs. {Number(coupon.amount).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {coupon.usedCount} / {coupon.maxUses ?? "∞"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {new Date(coupon.expiresAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <Badge>{isUsable ? "Active" : "Inactive"}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggle(coupon)}
                            aria-label={`${coupon.isActive ? "Deactivate" : "Activate"} ${coupon.code}`}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          >
                            {coupon.isActive ? (
                              <ToggleRight className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(coupon)}
                            aria-label={`Delete ${coupon.code}`}
                            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;
