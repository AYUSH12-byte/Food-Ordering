import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  ReceiptText,
} from "lucide-react";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const OrderSuccess = () => {
  const location = useLocation();

  const { order, payment, receipt } = location.state || {};

  // GET RECEIPT ID

  const receiptId = receipt?.id || receipt?._id || order?.receipt?._id;

  // NO ORDER DATA


  if (!order) {
    return (
      <div className="page-container flex min-h-[75vh] items-center justify-center py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Order information not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your order may still exist. You can check your order history to see
            your recent orders.
          </p>

          <Link to="/orders" className="mt-6 inline-block">
            <Button size="lg">
              <ShoppingBag className="h-4 w-4" />
              View My Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container flex min-h-[75vh] items-center justify-center py-8 sm:py-12">
      <div className="w-full max-w-3xl">
        {/* SUCCESS CARD */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          {/* Success Header */}

          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-11 w-11 text-green-600" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
              Order Placed Successfully
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Thank you for your order. Your restaurant will start preparing it
              soon.
            </p>
          </div>


          {/* ORDER INFORMATION */}

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            {/* Order ID + Status */}

            <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Order ID
                </p>

                <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                  {order._id}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Order Status
                </p>

                <div className="mt-2 sm:flex sm:justify-end">
                  <Badge>{order.orderStatus}</Badge>
                </div>
              </div>
            </div>

            {/* Amount + Payment */}

            <div className="grid gap-5 pt-5 sm:grid-cols-2">
              {/* Total */}

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Total Amount
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  Rs. {Number(order.totalAmount || 0).toFixed(2)}
                </p>
              </div>

              {Number(order.discountAmount) > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                    Coupon Discount · {order.couponCode}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-emerald-700">
                    − Rs. {Number(order.discountAmount).toFixed(2)}
                  </p>
                </div>
              )}

              {/* Payment */}

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Payment Method
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {payment?.paymentMethod || order.paymentMethod || "N/A"}
                </p>

                <div className="mt-2">
                  <Badge>
                    {payment?.paymentStatus || order.paymentStatus || "Pending"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* RECEIPT */}

            {receipt && (
              <div className="mt-6 border-t border-slate-200 pt-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Receipt Number
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <ReceiptText className="h-4 w-4 text-slate-400" />

                      <p className="text-sm font-bold text-slate-900">
                        {receipt.receiptNumber}
                      </p>
                    </div>
                  </div>

                  {receiptId && (
                    <Link to={`/receipts/${receiptId}`}>
                      <Button variant="secondary" size="sm">
                        <ReceiptText className="h-4 w-4" />
                        View Receipt
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/orders">
              <Button size="lg" className="w-full sm:w-auto">
                <ShoppingBag className="h-4 w-4" />
                View My Orders
              </Button>
            </Link>

            <Link to="/foods">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Small reassurance */}

        <p className="mt-5 text-center text-xs text-slate-400">
          You can track your order status anytime from your order history.
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
