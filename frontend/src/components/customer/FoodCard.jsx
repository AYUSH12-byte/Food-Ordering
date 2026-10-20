import { useState } from "react";
import { Clock, Check, Heart, Star, ShoppingCart } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";

const FoodCard = ({
  food,
  isFavorite = false,
  favoriteLoading = false,
  onToggleFavorite,
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();

  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async () => {
    // User must login first
    if (!user) {
      toast.warning("Please login to add food to cart");
      return;
    }

    // Only customers can use cart
    if (user.role !== "customer") {
      toast.error("Only customers can add food to cart");
      return;
    }

    try {
      setAdding(true);
      await addToCart(food._id, 1);
      toast.success(`Added ${food.name} to cart!`);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add food to cart"
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Food Image Container */}
        <div className="relative overflow-hidden bg-slate-100 aspect-4/3">
          {food.image ? (
            <img
              src={food.image}
              alt={food.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100">
              No Image Available
            </div>
          )}

          {/* Overlay shadow gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category Badge Overlay */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-800 shadow-xs border border-white/40">
              {food.category?.name || "Uncategorized"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite?.(food)}
            disabled={favoriteLoading}
            aria-label={
              isFavorite
                ? `Remove ${food.name} from favorites`
                : `Add ${food.name} to favorites`
            }
            aria-pressed={isFavorite}
            className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-sm transition hover:scale-105 disabled:opacity-60"
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
            />
          </button>

          {/* Preparation Time Pill */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white shadow-xs">
            <Clock className="h-3 w-3 text-orange-400" />
            <span>{food.preparationTime || 20} mins</span>
          </div>

          {/* Availability Overlay */}
          {!food.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
              <span className="rounded-full bg-rose-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                Unavailable
              </span>
            </div>
          )}
        </div>

        {/* Food Details */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
              {food.name}
            </h3>
            <div className="text-right">
              <span className="whitespace-nowrap text-lg font-extrabold text-orange-600">
                Rs. {Number(food.price).toFixed(2)}
              </span>
            </div>
          </div>

          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
            {food.description || "Freshly prepared gourmet meal made with quality ingredients."}
          </p>

          {/* Rating & Availability */}
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>
                {food.averageRating
                  ? Number(food.averageRating).toFixed(1)
                  : "New"}
              </span>
              <span className="text-slate-400 font-normal">
                ({food.reviewCount || 0}{" "}
                {food.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>

            <span
              className={`font-semibold text-[11px] ${
                food.isAvailable ? "text-emerald-600" : "text-rose-500"
              }`}
            >
              {food.isAvailable ? "• In Stock" : "• Out of Stock"}
            </span>
          </div>
        </div>
      </div>

      {/* Add to Cart Action */}
      <div className="p-5 pt-0">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!food.isAvailable || adding}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-200 shadow-md ${
            justAdded
              ? "bg-emerald-600 shadow-emerald-500/20"
              : food.isAvailable
              ? "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/20 active:scale-[0.98]"
              : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
          }`}
        >
          {adding ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Adding...
            </span>
          ) : justAdded ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4" /> Added to Cart
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {food.isAvailable ? "Add to Cart" : "Unavailable"}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;