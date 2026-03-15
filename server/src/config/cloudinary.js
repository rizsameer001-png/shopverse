const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Product images storage
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shopverse/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif' ,'avif'],
    quality: 'auto'
    //transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// Category images storage
const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shopverse/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp' ,'avif'],
     quality: 'auto'
    //transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

// Brand images storage
const brandStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shopverse/brands',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    transformation: [{ width: 300, height: 150, crop: 'fit', quality: 'auto' }],
  },
});

// Avatar storage
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shopverse/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill', quality: 'auto', gravity: 'face' }],
  },
});

const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).array('images', 10);

const uploadCategory = multer({
  storage: categoryStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('image');

const uploadBrand = multer({
  storage: brandStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('logo');

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('avatar');

module.exports = {
  cloudinary,
  uploadProduct,
  uploadCategory,
  uploadBrand,
  uploadAvatar,
};
