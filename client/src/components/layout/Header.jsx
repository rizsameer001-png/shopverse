import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Heart, User, Search, Menu, X, ChevronDown, LogOut, Package, MapPin, BookOpen } from 'lucide-react';
import { toggleCart } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { selectCartCount } from '../../store/slices/cartSlice';
import CurrencyLanguageSwitcher from '../common/CurrencyLanguageSwitcher';
import { useSettings } from '../../context/SettingsContext';

export default function Header() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user }   = useSelector(s => s.auth);
  const cartCount  = useSelector(selectCartCount);
  const wishlistCount = useSelector(s => s.wishlist.items.length);
  const categories = useSelector(s => s.products.categories);
  const { settings } = useSettings();

  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const userMenuRef = useRef();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const h = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => { dispatch(logout()); navigate('/'); setUserMenuOpen(false); };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white border-b border-gray-100'}`}>

      {/* Top utility bar */}
      <div className="bg-gray-900 text-gray-300 text-xs py-2">
        <div className="page-container flex items-center justify-between">
          <span className="hidden sm:block">
            🚚 Free shipping over ${settings.freeShippingThreshold || 50} &nbsp;|&nbsp;
            <span className="text-primary-400 font-bold">SAVE10</span> for 10% off
          </span>
          <span className="sm:hidden text-center w-full">Free shipping over ${settings.freeShippingThreshold || 50}</span>
          <div className="hidden sm:block">
            <CurrencyLanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="page-container">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            {settings.logo?.url ? (
              <img src={settings.logo.url} alt={settings.siteName} className="h-9 object-contain" />
            ) : (
              <span className="font-heading text-2xl font-bold text-gray-900">
                {settings.siteName?.split(' ')[0] || 'Shop'}
                <span className="text-primary-600">{settings.siteName?.split(' ').slice(1).join(' ') || 'Verse'}</span>
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
              Home
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                Shop <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                <Link to="/shop"                     className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-semibold">All Products</Link>
                <Link to="/shop?isFeatured=true"     className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600">⭐ Featured</Link>
                <Link to="/shop?isNewArrival=true"   className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600">🆕 New Arrivals</Link>
                <Link to="/shop?isBestSeller=true"   className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600">🔥 Best Sellers</Link>
                {categories.length > 0 && <div className="border-t border-gray-100 my-1" />}
                {categories.slice(0, 7).map(cat => (
                  <Link key={cat._id} to={`/shop/${cat.slug}`} className="block px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/blog" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all flex items-center gap-1">
              <BookOpen size={15} /> Blog
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Desktop search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
              <input type="text" placeholder="Search products..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-44 lg:w-60 pl-4 pr-9 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white" />
              <button type="submit" className="absolute right-3 text-gray-400 hover:text-primary-600 transition-colors">
                <Search size={15} />
              </button>
            </form>

            {/* Mobile search */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setSearchOpen(!searchOpen)}>
              <Search size={20} className="text-gray-600" />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Heart size={20} className="text-gray-600" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button onClick={() => dispatch(toggleCart())} className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ShoppingCart size={20} className="text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Mobile currency/language */}
            <div className="sm:hidden">
              <CurrencyLanguageSwitcher />
            </div>

            {/* User */}
            {user ? (
              <div ref={userMenuRef} className="relative ml-1">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                  {user.avatar?.url
                    ? <img src={user.avatar.url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    : <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{user.name[0].toUpperCase()}</span>
                      </div>}
                  <ChevronDown size={12} className="text-gray-400 hidden lg:block" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-1 animate-slide-down">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      {[
                        { to: '/profile',           icon: User,     label: 'My Profile'  },
                        { to: '/profile/orders',    icon: Package,  label: 'My Orders'   },
                        { to: '/wishlist',          icon: Heart,    label: 'Wishlist'    },
                        { to: '/profile/addresses', icon: MapPin,   label: 'Addresses'   },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link key={to} to={to} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Icon size={14} className="text-gray-400" /> {label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4 ml-1 hidden sm:block">Sign In</Link>
            )}

            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-xl ml-1" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} className="text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden pb-3 animate-slide-down">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input type="text" placeholder="Search products..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} autoFocus className="flex-1 input-field text-sm py-2.5" />
              <button type="submit" className="btn-primary px-4 py-2.5"><Search size={16} /></button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white animate-slide-down">
          <nav className="page-container py-3 space-y-0.5">
            {!user && (
              <div className="flex gap-2 pb-3 mb-2 border-b border-gray-100">
                <Link to="/login"    className="btn-primary    flex-1 text-center text-sm py-2.5">Sign In</Link>
                <Link to="/register" className="btn-outline flex-1 text-center text-sm py-2.5">Register</Link>
              </div>
            )}
            {[
              { to: '/',                    label: '🏠 Home'          },
              { to: '/shop',                label: '🛍️ All Products'  },
              { to: '/shop?isFeatured=true',label: '⭐ Featured'       },
              { to: '/shop?isNewArrival=true',label:'🆕 New Arrivals'  },
              { to: '/blog',                label: '📝 Blog'          },
              { to: '/wishlist',            label: '❤️ Wishlist'      },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors">
                {label}
              </Link>
            ))}
            {user && (
              <div className="border-t border-gray-100 pt-2 mt-2">
                <Link to="/profile"        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl">👤 My Profile</Link>
                <Link to="/profile/orders" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl">📦 My Orders</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl">🚪 Sign Out</button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
