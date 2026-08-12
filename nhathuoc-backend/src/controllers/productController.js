const productModel = require('../models/productModel');
const fs = require('fs');
const path = require('path');

// 1. TẠO SẢN PHẨM MỚI
const createProduct = async (req, res) => {
    try {
        // Lấy thông tin text từ body
        // --- CẬP NHẬT: Lấy thêm các trường thông tin y tế và nguồn gốc ---
        const { 
            name, slug, price, original_price, discount, quantity, unit, 
            categoryId, 
            // Thông tin cũ
            description, ingredients,
            // Thông tin MỚI (Y tế & Nguồn gốc)
            short_description, usage_dosage, contraindications, side_effects,
            manufacturer, origin, packaging, registration_num
        } = req.body;

        // Lấy danh sách ảnh từ Multer
        let imageFiles = req.files; 
        
        // Validate cơ bản
        if (!name || !slug || !price) {
            return res.status(400).json({ errCode: 1, message: 'Thiếu Tên, Slug hoặc Giá!' });
        }

        // Xử lý logic ảnh
        let mainImage = null;   
        let galleryJSON = null; 

        if (imageFiles && imageFiles.length > 0) {
            if (imageFiles.length > 5) {
                return res.status(400).json({ errCode: 3, message: 'Tối đa 5 ảnh!' });
            }
            const listLinks = imageFiles.map(file => file.filename);
            mainImage = listLinks[0]; 
            galleryJSON = JSON.stringify(listLinks); 
        } else {
             return res.status(400).json({ errCode: 3, message: 'Vui lòng chọn ít nhất 1 ảnh!' });
        }

        // Kiểm tra trùng Slug
        const checkSlug = await productModel.findProductBySlug(slug);
        if (checkSlug) {
            return res.status(400).json({ errCode: 2, message: 'Slug này đã tồn tại!' });
        }

        // Gom dữ liệu sạch
        const cleanData = {
            name,
            slug,
            price: parseFloat(price),
            original_price: original_price ? parseFloat(original_price) : 0,
            discount: discount ? parseInt(discount) : 0, 
            quantity: parseInt(quantity) || 0,
            unit: unit || 'Hộp',
            image: mainImage,       
            gallery: galleryJSON,   
            categoryId: categoryId ? parseInt(categoryId) : null,
            
            // --- CẬP NHẬT: Thêm các trường mới vào object data ---
            ingredients,
            description,
            short_description,
            usage_dosage,
            contraindications,
            side_effects,
            manufacturer,
            origin,
            packaging,
            registration_num
        };

        // Lưu vào DB
        const newProduct = await productModel.createProduct(cleanData);

        return res.status(200).json({
            errCode: 0,
            message: 'Tạo sản phẩm thành công!',
            data: newProduct
        });

    } catch (error) {
        console.log("LỖI SERVER:", error);
        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi server: ' + error.message
        });
    }
}

// 2. LẤY TẤT CẢ SẢN PHẨM (Kèm bộ lọc)
const getAllProducts = async(req, res) =>{
    try {
        let limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        let keyword = req.query.keyword;
        
        let categoryId = req.query.categoryId;
        let flashSale = req.query.flashSale; 
        
        let product = await productModel.getAllProducts(limit, keyword, categoryId, flashSale);
        
        return res.status(200).json({ errCode: 0, message: 'Ok', data: product });
    } catch (error) {
        return res.status(500).json({ errCode: -1, message: 'Lỗi server', error: error.message });
    }
}

// 3. LẤY 1 SẢN PHẨM
const getProductById = async(req, res) =>{
    try{
        const id = parseInt(req.params.id);
        let product = await productModel.getProductById(id)
        if(!product) return res.status(404).json({errCode: 0, message:'Không tìm thấy thuốc này!'});
        return res.status(200).json({ errCode: 0, message: 'Ok', data: product });
    }catch(error){
        return res.status(500).json({ errCode: -1, message: 'Lỗi server' });
    }
}

// 4. SỬA SẢN PHẨM
const updateProduct = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // --- CẬP NHẬT: Lấy thêm các trường thông tin y tế và nguồn gốc ---
        const { 
            name, slug, price, original_price, discount,
            quantity, unit, images, categoryId, 
            // Thông tin cũ
            description, ingredients,
            // Thông tin MỚI
            short_description, usage_dosage, contraindications, side_effects,
            manufacturer, origin, packaging, registration_num
        } = req.body;

        // Kiểm tra tồn tại
        const checkProduct = await productModel.getProductById(id);
        if (!checkProduct) {
            return res.status(404).json({ errCode: 1, message: 'Không tìm thấy sản phẩm để sửa!' });
        }

        // Giữ ảnh cũ
        let mainImage = checkProduct.image;
        let galleryJSON = checkProduct.gallery;

        // Nếu FE gửi mảng tên ảnh mới
        if (images && Array.isArray(images)) {
            if (images.length > 5) {
                return res.status(400).json({ errCode: 3, message: 'Chỉ được up tối đa 5 ảnh!' });
            }

            // XÓA ẢNH CŨ KHÔNG CÒN DÙNG
            if (checkProduct.gallery) {
                const oldGallery = JSON.parse(checkProduct.gallery); 
                oldGallery.forEach(file => {
                    if (!images.includes(file)) {
                        const oldPath = path.join(__dirname, '../uploads', file);
                        if (fs.existsSync(oldPath)) {
                            fs.unlinkSync(oldPath);
                        }
                    }
                });
            }

            // Gán ảnh mới
            mainImage = images[0] || null;
            galleryJSON = JSON.stringify(images);
        }

        // Gom dữ liệu sạch
        const cleanData = {
            name,
            slug,
            price: parseFloat(price),
            original_price: original_price ? parseFloat(original_price) : 0,
            discount: discount ? parseInt(discount) : 0,
            quantity: parseInt(quantity) || 0,
            unit: unit || 'Hộp',
            image: mainImage,
            gallery: galleryJSON,
            categoryId: categoryId ? parseInt(categoryId) : null,
            
            // --- CẬP NHẬT: Thêm các trường mới vào object data ---
            ingredients,
            description,
            short_description,
            usage_dosage,
            contraindications,
            side_effects,
            manufacturer,
            origin,
            packaging,
            registration_num
        };

        // Update DB
        const updatedProduct = await productModel.updateProduct(id, cleanData);

        return res.status(200).json({
            errCode: 0,
            message: 'Cập nhật thành công!',
            data: updatedProduct
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi server hoặc Slug bị trùng',
            error: error.message
        });
    }
};

// 5. XÓA SẢN PHẨM
const deleteProduct = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // Kiểm tra tồn tại
        const product = await productModel.getProductById(id);
        if (!product) {
            return res.status(404).json({ errCode: 1, message: 'Sản phẩm không tồn tại!' });
        }

        // XÓA ẢNH ĐẠI DIỆN
        if (product.image) {
            const imagePath = path.join(__dirname, '../uploads', product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // XÓA ALBUM ẢNH
        if (product.gallery) {
            const galleryArr = JSON.parse(product.gallery);
            galleryArr.forEach(file => {
                const filePath = path.join(__dirname, '../uploads', file);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        // XÓA DB
        await productModel.deleteProduct(id);

        return res.status(200).json({
            errCode: 0,
            message: 'Xóa sản phẩm và ảnh thành công!'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi server'
        });
    }
};
// --- API LẤY CHI TIẾT SẢN PHẨM THEO SLUG ---
const getDetailProductBySlug = async(req, res) =>{
    try{
        // lấy slug từ đường dẫn URL
        const {slug} = req.params;
        if(!slug){
            return res.status(400).json({errCode:1, message:"Thiếu slug sản phẩm"});
        }
        // gọi model để tìm trong DB
        const product = await productModel.getDetailProductBySlug(slug);
        // kiểm tra kết quả
        if(!product){
            return res.status(404).json({errCode: 2, message:"Không tìm thấy sản phẩm"});
        }
        // trả dữ liệu
        return res.status(200).json({
            errCode: 0,
            message:"OK",
            data: product
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({errCode:-1, message:"Lỗi server"});
    }
}
const getCartProduct = async (req, res) => {
    try {
        // nhận cả id và ids
        let { ids, id } = req.body;

        // FE gửi id -> chuyển thành ids
        const productIds = ids || id;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(200).json({
                errCode: 0,
                message: 'Giỏ hàng trống',
                data: []
            });
        }

        const products = await productModel.getCartProductModel(productIds);

        return res.status(200).json({
            errCode: 0,
            message: 'Ok',
            data: products
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ errCode: -1, message: 'Lỗi server' });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getDetailProductBySlug,
    getCartProduct
}