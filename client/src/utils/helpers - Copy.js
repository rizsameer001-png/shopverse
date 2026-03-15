export const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price || 0);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));

export const truncate = (str, n = 60) => (str?.length > n ? str.slice(0, n) + '...' : str);

export const getDiscountPercent = (price, comparePrice) =>
  comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

export const getProductImage = (product, index = 0) => {
  if (!product?.images?.length) return '/placeholder.png';
  const def = product.images.find(i => i.isDefault);
  return def ? def.url : product.images[index]?.url || '/placeholder.png';
};

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

export const RETURN_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
};
