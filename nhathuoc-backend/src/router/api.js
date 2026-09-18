const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/middlewares');
const productController = require('../controllers/productController')
const upload = require('../middlewares/upload');
const categoryController = require('../controllers/categoryController');
const orderController = require('../controllers/orderController')
router.post('/register', authController.register);
router.post('/login', authController.login);

// Ví dụ một route cần bảo mật (Xem thông tin cá nhân)
router.get('/profile', verifyToken, (req, res) => {
    res.json({ message: "Chào mừng bạn", user: req.user });
});
// lấy thông tin tất cả người dùng
router.get('/users', authController.getAllUsers);
router.get('/users/:id', authController.getUserById);
router.put('/users/:id', authController.updateUser);
router.delete('/users/:id', authController.deleteUser);
router.post('/users/forget-pass', authController.forgotPassword)
router.post('/users/reset-pass', authController.resetPassword)
router.put('/users/change-password/:id', verifyToken, authController.changePassword)
// ===============API PRODUCT========================
router.post("/products-create", verifyToken,upload.array('images',5),productController.createProduct);
router.get("/products", productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.put("/products/:id",verifyToken, upload.array('images', 5),productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);
// ===============API CATEGORY========================

router.get("/categories", categoryController.getAllCategory);
router.post("/categories-create", verifyToken, categoryController.createCategory);
router.get("/categories/:id", verifyToken, categoryController.getCategoryById);
router.put("/categories/:id", verifyToken, categoryController.updateCategory);
router.delete("/categories/:id", verifyToken, categoryController.deleteCategory);
// ===============API PRODUCTDETAIL========================
router.get("/get-product-by-slug/:slug", productController.getDetailProductBySlug);
router.post("/product/cart", productController.getCartProduct)
// ===============Order========================
// Khách hàng
router.post('/orders', verifyToken, orderController.createOrder)
router.get('/orders/my-orders', verifyToken, orderController.getMyOrders)
router.get('/orders/:id', verifyToken, orderController.getOrderDetail)
// Admin / Quản lý
router.get('/admin/orders', verifyToken, orderController.getAllOrders);
router.put('/admin/orders/:id/status', verifyToken, orderController.updateStatus);
module.exports = router;