import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { fetchProducts, setFilter, setPage, clearFilters } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { Pagination, ProductSkeleton } from '../components/common';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ShopPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { category: catSlug } = useParams();
  const [searchParams] = useSearchParams();

  const { items, loading, total, pages, filters, categories, brands } = useSelector(s => s.products);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ categories: true, brands: true, price: true, rating: true });

  // Build and fire the fetch whenever filters or URL params change
  useEffect(() => {
    const params = { ...filters };

    // URL query overrides (keyword, feature flags, brand)
    const keyword = searchParams.get('keyword');
    const isFeatured = searchParams.get('isFeatured');
    const isNewArrival = searchParams.get('isNewArrival');
    const isBestSeller = searchParams.get('isBestSeller');
    const brandParam = searchParams.get('brand');

    if (keyword) params.keyword = keyword;
    if (isFeatured) params.isFeatured = 'true';
    if (isNewArrival) params.isNewArrival = 'true';
    if (isBestSeller) params.isBestSeller = 'true';
    if (brandParam) params.brand = brandParam;

    // Category from URL slug
    if (catSlug) {
      const cat = categories.find(c => c.slug === catSlug);
      if (cat) params.category = cat._id;
    }

    dispatch(fetchProducts(params));
  }, [filters, catSlug, searchParams, categories, dispatch]);

  const toggleSection = (key) => setExpandedSections(p => ({ ...p, [key]: !p[key] }));

  const FilterSection = ({ title, sectionKey, children }) => (
    <div className="border-b border-gray-100 pb-4">
      <button onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full mb-3 text-left">
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        {expandedSections[sectionKey] ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {expandedSections[sectionKey] && children}
    </div>
  );

  const Sidebar = () => (
    <aside className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">Filters</h3>
        <button onClick={() => dispatch(clearFilters())} className="text-xs text-primary-600 hover:underline font-medium">
          Clear All
        </button>
      </div>

      {/* Categories */}
      <FilterSection title="Categories" sectionKey="categories">
        <div className="space-y-1.5">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input type="radio" name="cat" checked={!filters.category} onChange={() => dispatch(setFilter({ category: '' }))} className="text-primary-600 w-3.5 h-3.5" />
            <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">All Categories</span>
          </label>
          {categories.map(cat => (
            <label key={cat._id} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <input type="radio" name="cat" checked={filters.category === cat._id} onChange={() => dispatch(setFilter({ category: cat._id }))} className="text-primary-600 w-3.5 h-3.5" />
                <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">{cat.name}</span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brands" sectionKey="brands">
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {brands.map(brand => (
              <label key={brand._id} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={filters.brand === brand._id}
                  onChange={() => dispatch(setFilter({ brand: filters.brand === brand._id ? '' : brand._id }))}
                  className="text-primary-600 w-3.5 h-3.5 rounded" />
                <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">{brand.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range" sectionKey="price">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Min ($)</label>
              <input type="number" placeholder="0" min="0" value={filters.minPrice}
                onChange={e => dispatch(setFilter({ minPrice: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Max ($)</label>
              <input type="number" placeholder="Any" min="0" value={filters.maxPrice}
                onChange={e => dispatch(setFilter({ maxPrice: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          {/* Quick price filters */}
          <div className="flex flex-wrap gap-1.5">
            {[['Under $25', '', '25'], ['$25–$50', '25', '50'], ['$50–$100', '50', '100'], ['Over $100', '100', '']].map(([label, min, max]) => (
              <button key={label} onClick={() => dispatch(setFilter({ minPrice: min, maxPrice: max }))}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${filters.minPrice === min && filters.maxPrice === max ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Min Rating" sectionKey="rating">
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map(r => (
            <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="rating" checked={filters.minRating === String(r)}
                onChange={() => dispatch(setFilter({ minRating: String(r) }))}
                className="text-primary-600 w-3.5 h-3.5" />
              <div className="flex items-center gap-1">
                {Array(5).fill(0).map((_, i) => (
                  <span key={i} className={`text-sm ${i < r ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                ))}
                <span className="text-xs text-gray-500 ml-1">& Up</span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>
    </aside>
  );

  const currentCatName = catSlug
    ? categories.find(c => c.slug === catSlug)?.name || catSlug
    : searchParams.get('keyword') ? `Results for "${searchParams.get('keyword')}"` : 'All Products';

  return (
    <div className="page-container py-8 min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-primary-600 transition-colors">Home</a>
        <span className="text-gray-300">/</span>
        <span className="text-gray-800 font-semibold capitalize">{currentCatName}</span>
      </nav>

      <div className="flex gap-7">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <Sidebar />
          </div>
        </aside>

        {/* Products area */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => setDrawerOpen(true)}
                className="lg:hidden btn-outline py-2 text-sm flex items-center gap-2">
                <SlidersHorizontal size={14} /> Filters
              </button>
              <p className="text-sm text-gray-500">
                {loading ? (
                  <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 border border-primary-400 border-t-transparent rounded-full animate-spin" /> Loading...</span>
                ) : (
                  <><span className="font-semibold text-gray-800">{total}</span> products</>
                )}
              </p>
            </div>
            <select
              value={filters.sort}
              onChange={e => dispatch(setFilter({ sort: e.target.value }))}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array(12).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-700">No products found</h3>
              <p className="text-gray-400 mt-1 text-sm">Try adjusting your filters or search terms</p>
              <button onClick={() => { dispatch(clearFilters()); navigate('/shop'); }}
                className="btn-primary mt-5 px-6">Clear All Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          <Pagination page={filters.page} pages={pages} onPageChange={p => dispatch(setPage(p))} />
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white p-5 overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-gray-900">Filters</h3>
              <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <Sidebar />
            <button onClick={() => setDrawerOpen(false)} className="btn-primary w-full mt-5">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
