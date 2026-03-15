// Standalone formatPrice (used in non-component contexts / outside SettingsContext)
// Components should use formatPrice from useSettings() for currency conversion
export const formatPrice = (price, currencyCode = 'USD') => {
  if (price == null) return '';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(price));
  } catch {
    return `$${Number(price).toFixed(2)}`;
  }
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
};

export const truncate = (str, n = 60) =>
  str?.length > n ? str.slice(0, n) + '…' : str || '';

export const getDiscountPercent = (price, comparePrice) =>
  comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

export const getProductImage = (product, index = 0) => {
  if (!product?.images?.length) return 'https://placehold.co/400x400?text=No+Image';
  const def = product.images.find(i => i.isDefault);
  return (def || product.images[index] || product.images[0])?.url || 'https://placehold.co/400x400?text=No+Image';
};

export const calcDiscountedPrice = (price, discount) =>
  discount > 0 ? +(price * (1 - discount / 100)).toFixed(2) : price;

export const ORDER_STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100   text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100  text-green-700',
  cancelled:  'bg-red-100    text-red-700',
  refunded:   'bg-gray-100   text-gray-600',
};

export const RETURN_STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100  text-green-700',
  rejected:  'bg-red-100    text-red-700',
  completed: 'bg-gray-100   text-gray-600',
};
