import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { ProductSkeleton } from '../components/common';
import { ArrowRight, Shield, Truck, RefreshCw, Headphones, Star, ShoppingBag } from 'lucide-react';
import api from '../utils/api';
import { useSettings } from '../context/SettingsContext';

const FEATURES = [
  { icon: Truck,       title: 'Free Shipping',  desc: 'On qualifying orders',  color: 'bg-blue-100   text-blue-600'   },
  { icon: RefreshCw,   title: 'Easy Returns',   desc: '30-day return policy',  color: 'bg-green-100  text-green-600'  },
  { icon: Shield,      title: 'Secure Payment', desc: '100% safe checkout',    color: 'bg-purple-100 text-purple-600' },
  { icon: Headphones,  title: '24/7 Support',   desc: "We're here to help",    color: 'bg-orange-100 text-orange-600' },
];

const TESTIMONIALS = [
  { name: 'Sarah M.',  initials: 'S', rating: 5, text: 'Amazing quality! Fast shipping and great customer service. Will definitely shop again.' },
  { name: 'John D.',   initials: 'J', rating: 5, text: 'Best online shopping experience. The wishlist makes it easy to save items for later.' },
  { name: 'Emma R.',   initials: 'E', rating: 5, text: 'Love the variety and the easy return policy. Checkout is super smooth!' },
];

const FALLBACK_SLIDES = [
  { bg: 'from-orange-50 to-amber-50', tag: 'New Collection', title: 'Discover Premium\nProducts', sub: 'Shop the latest trends with exclusive deals', cta: 'Shop Now', link: '/shop?isNewArrival=true', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=700&q=80' },
  { bg: 'from-blue-50 to-indigo-50',  tag: '⭐ Best Sellers',  title: 'Top Rated\nFavorites',       sub: 'Loved by thousands of happy customers',      cta: 'Explore',   link: '/shop?isBestSeller=true', img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=80' },
  { bg: 'from-rose-50 to-pink-50',    tag: '🔥 Flash Sale',    title: 'Up to 50% Off\nItems',        sub: "Limited time — grab them before they're gone", cta: 'View Deals', link: '/shop', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=80' },
];

/* ── New Arrivals (separate fetch) ─────────────────────────── */
function NewArrivalsSection() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  useEffect(() => {
    api.get('/products', { params: { isNewArrival: true, limit: 4, isActive: true } })
      .then(r => setProducts(r.data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)}</div>;
  if (products.length === 0) return (
    <div className="text-center py-10 bg-gray-50 rounded-2xl">
      <p className="text-gray-400 text-sm">No new arrivals yet.</p>
      <Link to="/shop" className="text-primary-600 hover:underline text-sm mt-1 inline-block font-medium">Browse all →</Link>
    </div>
  );
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">{products.map(p => <ProductCard key={p._id} product={p} />)}</div>;
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function HomePage() {
  const dispatch = useDispatch();
  const { items: featuredProducts, loading, categories, brands } = useSelector(s => s.products);
  const { settings } = useSettings();

  const [heroBanners,  setHeroBanners]  = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchProducts({ isFeatured: true, limit: 8, isActive: true }));
    api.get('/banners', { params: { isActive: true } })
      .then(r => {
        const all = r.data.data || [];
        setHeroBanners(all.filter(b => b.position === 'hero'));
        setPromoBanners(all.filter(b => b.position === 'promo'));
      })
      .catch(() => {})
      .finally(() => setBannersLoading(false));
  }, [dispatch]);

  const heroSlides = heroBanners.length > 0 ? heroBanners : FALLBACK_SLIDES;

  return (
    <div className="animate-fade-in">

      {/* ══ HERO SLIDER ══════════════════════════════════════ */}
      <section>
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation loop
          className="w-full"
        >
          {heroSlides.map((slide, i) => {
            const isBanner = !!slide._id;
            return (
              <SwiperSlide key={isBanner ? slide._id : i}>
                <div
                  className={`min-h-[480px] md:min-h-[580px] flex items-center ${!isBanner ? `bg-gradient-to-r ${slide.bg}` : ''}`}
                  style={isBanner ? { backgroundColor: slide.bgColor || '#fff7ed' } : {}}
                >
                  {/* Banner with image */}
                  {isBanner && slide.image?.url ? (
                    <div className="relative w-full min-h-[480px] md:min-h-[580px]">
                      <img src={slide.image.url} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="relative page-container h-full flex items-center py-12">
                        <div className="max-w-xl space-y-4">
                          <h1 className="font-heading text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-md">{slide.title}</h1>
                          {slide.subtitle && <p className="text-white/90 text-lg">{slide.subtitle}</p>}
                          {slide.buttonText && (
                            <Link to={slide.buttonLink || '/shop'} className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-3 rounded-2xl font-bold hover:bg-primary-50 transition-colors shadow-xl">
                              {slide.buttonText} <ArrowRight size={18} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Fallback gradient slides */
                    <div className="page-container w-full">
                      <div className="grid md:grid-cols-2 gap-8 items-center py-12">
                        <div className="space-y-5">
                          <span className="inline-block badge bg-primary-100 text-primary-700 text-sm px-4 py-1.5 font-semibold rounded-full">{slide.tag}</span>
                          <h1 className="font-heading text-4xl md:text-6xl font-black text-gray-900 leading-tight whitespace-pre-line">{slide.title}</h1>
                          <p className="text-gray-500 text-lg max-w-md leading-relaxed">{slide.sub || slide.subtitle}</p>
                          <div className="flex gap-3 flex-wrap">
                            <Link to={slide.link || slide.buttonLink || '/shop'} className="btn-primary text-base px-8 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
                              <ShoppingBag size={18} /> {slide.cta || slide.buttonText || 'Shop Now'}
                            </Link>
                            <Link to="/shop" className="btn-outline text-base px-8 py-3">Browse All</Link>
                          </div>
                        </div>
                        <div className="hidden md:block">
                          <img src={slide.img} alt={slide.title}
                            className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl object-cover aspect-[4/3]"
                            onError={e => { e.target.style.display = 'none'; }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </section>

      {/* ══ FEATURES BAR ═════════════════════════════════════ */}
      <section className="border-y border-gray-100 bg-white">
        <div className="page-container py-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}><Icon size={20} /></div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CATEGORIES ═══════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="page-container py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">Explore</p>
              <h2 className="section-title">Shop by Category</h2>
            </div>
            <Link to="/shop" className="text-primary-600 font-semibold text-sm hover:underline flex items-center gap-1">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map(cat => (
              <Link key={cat._id} to={`/shop/${cat.slug}`}
                className="group flex flex-col items-center p-4 rounded-2xl border-2 border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-300 text-center">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 mb-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  {cat.image?.url
                    ? <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" style={{ imageRendering: 'auto' }} />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>}
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══ FEATURED PRODUCTS ════════════════════════════════ */}
      <section className="bg-gray-50/70 py-14">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">Hand-picked</p>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link to="/shop?isFeatured=true" className="text-primary-600 font-semibold text-sm hover:underline flex items-center gap-1">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {loading
              ? Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              : featuredProducts.length > 0
                ? featuredProducts.map(p => <ProductCard key={p._id} product={p} />)
                : (
                  <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <ShoppingBag size={48} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-500 font-medium">No featured products yet</p>
                    <Link to="/shop" className="btn-primary mt-5 inline-flex px-6">Browse All Products</Link>
                  </div>
                )
            }
          </div>
        </div>
      </section>

      {/* ══ PROMO BANNERS ════════════════════════════════════ */}
      <section className="page-container py-14">
        <div className="grid md:grid-cols-2 gap-5">
          {promoBanners.length >= 2 ? (
            promoBanners.slice(0, 2).map(b => (
              <div key={b._id} className="relative rounded-3xl overflow-hidden min-h-[200px]"
                style={{ backgroundColor: b.bgColor || '#f97316' }}>
                {b.image?.url && <img src={b.image.url} alt={b.title} className="absolute inset-0 w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative p-8">
                  <h3 className="font-heading text-2xl font-black" style={{ color: b.textColor || '#fff' }}>{b.title}</h3>
                  {b.subtitle && <p className="mt-1 opacity-90 text-sm" style={{ color: b.textColor || '#fff' }}>{b.subtitle}</p>}
                  <Link to={b.buttonLink || '/shop'}
                    className="mt-4 inline-flex items-center gap-2 bg-white/90 text-gray-900 px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-white transition-colors shadow-lg">
                    {b.buttonText || 'Shop Now'} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="relative bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-8 text-white overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full" />
                <span className="badge bg-white/20 text-white text-sm px-3 py-1 rounded-full">⏰ Limited Time</span>
                <h3 className="font-heading text-3xl font-black mt-3">Summer Sale</h3>
                <p className="mt-2 opacity-90 text-sm">Up to 50% off on seasonal collections</p>
                <Link to="/shop" className="mt-5 inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-2.5 rounded-2xl font-bold hover:bg-orange-50 transition-colors shadow-lg">
                  Shop Now <ArrowRight size={16} />
                </Link>
              </div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full" />
                <span className="badge bg-white/20 text-white text-sm px-3 py-1 rounded-full">🆕 Just Arrived</span>
                <h3 className="font-heading text-3xl font-black mt-3">Fresh Styles</h3>
                <p className="mt-2 opacity-90 text-sm">Discover the latest trends & collections</p>
                <Link to="/shop?isNewArrival=true" className="mt-5 inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-primary-600 transition-colors shadow-lg">
                  Explore <ArrowRight size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ══ NEW ARRIVALS ══════════════════════════════════════ */}
      <section className="bg-white py-14">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">Just In</p>
              <h2 className="section-title">New Arrivals</h2>
            </div>
            <Link to="/shop?isNewArrival=true" className="text-primary-600 font-semibold text-sm hover:underline flex items-center gap-1">View All <ArrowRight size={14} /></Link>
          </div>
          <NewArrivalsSection />
        </div>
      </section>

      {/* ══ BRANDS ════════════════════════════════════════════ */}
      {brands.length > 0 && (
        <section className="border-t border-gray-100 py-12 bg-gray-50">
          <div className="page-container">
            <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Trusted Brands</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {brands.slice(0, 8).map(brand => (
                <Link key={brand._id} to={`/shop?brand=${brand._id}`}
                  className="grayscale hover:grayscale-0 opacity-40 hover:opacity-100 transition-all duration-300">
                  {brand.logo?.url
                    ? <img src={brand.logo.url} alt={brand.name} className="h-8 md:h-10 object-contain" style={{ imageRendering: 'auto' }} />
                    : <span className="font-heading font-black text-lg text-gray-500 hover:text-gray-700 transition-colors">{brand.name}</span>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ TESTIMONIALS ══════════════════════════════════════ */}
      <section className="py-14 bg-white">
        <div className="page-container">
          <h2 className="section-title text-center mb-10">What Customers Say</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-6 hover:shadow-product-hover transition-shadow">
                <div className="flex gap-0.5 mb-3">
                  {Array(t.rating).fill(0).map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">{t.initials}</div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">Verified Buyer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
