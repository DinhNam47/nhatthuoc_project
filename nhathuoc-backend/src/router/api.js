const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/middlewares');
const productController = require('../controllers/productController')
const upload = require('../middlewares/upload');
const categoryController = require('../controllers/categoryController');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Ví dụ một route cần bảo mật (Xem thông tin cá nhân)
router.get('/profile', verifyToken, (req, res) => {
    res.json({ message: "Chào mừng bạn", user: req.user });
});
// lấy thông tin tất cả người dùng
router.get('/users', authController.getAllUsers);
// lấy 1 người dùng
router.get('/users/:id', authController.getUserById);
//sửa thông tin người dùng
router.put('/users/:id', authController.updateUser);
// xóa người dùng
router.delete('/users/:id', authController.deleteUser);
// ===============API PRODUCT========================
router.post("/products-create", verifyToken,upload.array('images',5),productController.createProduct);
// lấy tất cả thông tin product
router.get("/products", productController.getAllProducts);
// lấy 1 product
router.get('/products/:id', productController.getProductById);
// sửa 1 porduct
router.put("/products/:id",verifyToken, upload.array('images', 5),productController.updateProduct);
// 5. Xóa: DELETE http://localhost:8080/api/products/1
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
module.exports = router;