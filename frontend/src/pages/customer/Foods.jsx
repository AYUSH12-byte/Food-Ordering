import { useEffect, useMemo, useState } from "react";
import { Search, RotateCcw, Utensils } from "lucide-react";

import FoodCard from "../../components/customer/FoodCard";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { getFoods } from "../../services/foodService";
import { getCategories } from "../../services/categoryService";

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState("available");
  const [minimumRating, setMinimumRating] = useState("any");
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [foodsResponse, categoriesResponse] = await Promise.all([
        getFoods(),
        getCategories(),
      ]);

      setFoods(foodsResponse.foods || []);
      setCategories(categoriesResponse.categories || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredFoods = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const filtered = foods.filter((food) => {
      const searchMatch =
        !searchTerm ||
        food.name.toLowerCase().includes(searchTerm) ||
        food.description?.toLowerCase().includes(searchTerm);

      const foodCategory = food.category?._id || food.category;
      const categoryMatch = !category || foodCategory === category;

      const price = Number(food.price);
      const priceMatch =
        (minimumPrice === "" || price >= Number(minimumPrice)) &&
        (maximumPrice === "" || price <= Number(maximumPrice));
      const averageRating = Number(food.averageRating) || 0;
      const ratingMatch =
        minimumRating === "any" ||
        averageRating >= Number(minimumRating);

      const availabilityMatch =
        availability === "all"
          ? true
          : availability === "available"
          ? food.isAvailable
          : !food.isAvailable;

      return (
        searchMatch &&
        categoryMatch &&
        priceMatch &&
        ratingMatch &&
        availabilityMatch
      );
    });

    return filtered.sort((first, second) => {
      if (sortBy === "price-low") {
        return Number(first.price) - Number(second.price);
      }
      if (sortBy === "price-high") {
        return Number(second.price) - Number(first.price);
      }
      if (sortBy === "rating") {
        return (
          (Number(second.averageRating) || 0) -
          (Number(first.averageRating) || 0)
        );
      }
      return new Date(second.createdAt) - new Date(first.createdAt);
    });
  }, [
    foods,
    search,
    category,
    availability,
    minimumRating,
    minimumPrice,
    maximumPrice,
    sortBy,
  ]);

  const hasInvalidPriceRange =
    minimumPrice !== "" &&
    maximumPrice !== "" &&
    Number(minimumPrice) > Number(maximumPrice);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setAvailability("available");
    setMinimumRating("any");
    setMinimumPrice("");
    setMaximumPrice("");
    setSortBy("newest");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 border border-orange-200/80 mb-3">
          <Utensils className="h-3.5 w-3.5" />
          <span>Our Complete Menu</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Explore Gourmet Dishes
        </h1>
        <p className="mt-2 text-sm text-slate-600 font-medium max-w-2xl">
          Select from our hand-prepared pizzas, burgers, pastas, and sides made fresh with quality ingredients.
        </p>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setCategory("")}
          className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            category === ""
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          All Categories
        </button>
        {categories
          .filter((cat) => cat.isActive)
          .map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => setCategory(cat._id)}
              className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                category === cat._id
                  ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
      </div>

      {/* Search & Secondary Controls */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search Bar */}
          <div className="md:col-span-2 relative">
            <label className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Search Food
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or description..."
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
            >
              <option value="">All Categories</option>
              {categories
                .filter((item) => item.isActive)
                .map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Stock Status
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
            >
              <option value="available">In Stock Only</option>
              <option value="all">Show All Items</option>
              <option value="unavailable">Out of Stock</option>
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Minimum Rating
            </label>
            <select
              value={minimumRating}
              onChange={(e) => setMinimumRating(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
            >
              <option value="any">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label
              htmlFor="minimum-price"
              className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Minimum Price
            </label>
            <input
              id="minimum-price"
              type="number"
              min="0"
              step="0.01"
              value={minimumPrice}
              onChange={(e) => setMinimumPrice(e.target.value)}
              placeholder="Rs. 0"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
            />
          </div>

          <div>
            <label
              htmlFor="maximum-price"
              className="mb-1 block text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Maximum Price
            </label>
            <input
              id="maximum-price"
              type="number"
              min="0"
              step="0.01"
              value={maximumPrice}
              onChange={(e) => setMaximumPrice(e.target.value)}
              placeholder="No limit"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
            />
          </div>
        </div>

        {hasInvalidPriceRange && (
          <p className="text-xs font-semibold text-rose-600" role="alert">
            Minimum price cannot be greater than maximum price.
          </p>
        )}

        {/* Filter Summary */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
          <span>
            Showing <strong className="text-slate-900 font-bold">{filteredFoods.length}</strong> items
          </span>

          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-slate-600 hover:text-orange-600 font-bold transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* Grid View */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <SkeletonCard key={item} />
          ))}
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="my-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 mx-auto mb-4">
            <Utensils className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No dishes match your search</h2>
          <p className="mt-1 text-xs text-slate-500">
            Try changing your search, price range, rating, or other filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFoods.map((food) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Foods;
