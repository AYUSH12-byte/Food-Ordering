import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderTree,
  Utensils,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Users,
  Tag,
  LogOut,
  UtensilsCrossed,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: FolderTree,
    },
    {
      label: "Foods",
      path: "/admin/foods",
      icon: Utensils,
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      label: "Payments",
      path: "/admin/payments",
      icon: CreditCard,
    },
    {
      label: "Coupons",
      path: "/admin/coupons",
      icon: Tag,
    },
    {
      label: "Feedback",
      path: "/admin/feedback",
      icon: MessageSquare,
    },
    {
      label: "Customers",
      path: "/admin/customers",
      icon: Users,
    },
  ];

  const navLinkClass = ({ isActive }) =>
    `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20 font-semibold"
        : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden animate-fade-in"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 text-slate-100 transition-transform duration-300 ease-in-out border-r border-slate-800/80 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-800/80 px-6 justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-sm">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">
                Food<span className="text-orange-500">Order</span>
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Admin Console
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Main Navigation
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-40" />
              </NavLink>
            );
          })}
        </nav>

        {/* Links & Logout */}
        <div className="border-t border-slate-800/80 p-4 space-y-2">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Logout Account
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
