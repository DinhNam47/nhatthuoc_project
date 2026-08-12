const { PrismaClient } = require('../generated/client');
const prisma = new PrismaClient();

// Hàm 1: Kiểm tra xem slug có trùng không
const findProductBySlug = async (slug) => {
    return await prisma.product.findUnique({
        where: { slug: slug }
    });
};

// Hàm 2: Tạo sản phẩm mới (CẬP NHẬT ĐẦY ĐỦ CÁC TRƯỜNG)
const createProduct = async (data) => {
    return await prisma.product.create({
        data: {
            // --- Thông tin cơ bản ---
            name: data.name,
            slug: data.slug,
            price: data.price,
            original_price: data.original_price,
            discount: data.discount || 0,
            quantity: data.quantity,
            unit: data.unit,
            image: data.image,
            gallery: data.gallery, // <-- Thêm trường ảnh phụ
            categoryId: data.categoryId,

            // --- THÊM MỚI: Các trường Y tế & Nguồn gốc ---
            short_description: data.short_description,
            description: data.description,
            ingredients: data.ingredients,
            usage_dosage: data.usage_dosage,
            contraindications: data.contraindications,
            side_effects: data.side_effects,
            
            manufacturer: data.manufacturer,
            origin: data.origin,
            packaging: data.packaging,
            registration_num: data.registration_num
        }
    });
}

// Hàm 3: Lấy danh sách (Giữ nguyên logic lọc của bạn)
const getAllProducts = async (limit, keyword, categoryId, isFlashSale) => {
    let options = {
        orderBy: { createdAt: 'desc' },
        include: { category: true },
        where: {} 
    };

    if (limit) options.take = parseInt(limit);

    if (keyword) {
        options.where.name = {
            contains: keyword 
        };
    }

    if (categoryId) {
        options.where.categoryId = parseInt(categoryId);
    }

    if (isFlashSale === 'true' || isFlashSale === true) {
        options.where.discount = {
            gt: 0 
        };
    }

    return await prisma.product.findMany(options);
}

// Hàm 4: Lấy 1 sản phẩm theo ID
const getProductById = async (id) => {
    return await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: { category: true }
    });
};

// Hàm 5: Cập nhật sản phẩm (CẬP NHẬT ĐẦY ĐỦ CÁC TRƯỜNG)
const updateProduct = async (id, data) => {
    return await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
            // --- Thông tin cơ bản ---
            name: data.name,
            slug: data.slug,
            price: data.price,
            original_price: data.original_price,
            discount: data.discount, 
            quantity: data.quantity,
            unit: data.unit,
            image: data.image,
            gallery: data.gallery, // <-- Thêm trường ảnh phụ
            categoryId: data.categoryId,

            // --- THÊM MỚI: Các trường Y tế & Nguồn gốc ---
            short_description: data.short_description,
            description: data.description,
            ingredients: data.ingredients,
            usage_dosage: data.usage_dosage,
            contraindications: data.contraindications,
            side_effects: data.side_effects,
            
            manufacturer: data.manufacturer,
            origin: data.origin,
            packaging: data.packaging,
            registration_num: data.registration_num
        }
    });
};

// Hàm 6: Xóa sản phẩm
const deleteProduct = async (id) => {
    return prisma.product.delete({ 
        where: { id: parseInt(id) } 
    });
}

const getDetailProductBySlug = async(slug) =>{
    return prisma.product.findUnique({
        where:{slug: slug},
        include: {category: true} // lấy kèm thông tin danh mục
    });
};
const getCartProductModel = async (ids) => {

    // ÉP KIỂU SANG NUMBER
    const numberIds = ids.map(id => parseInt(id));

    return await prisma.product.findMany({
        where: {
            id: { in: numberIds }
        },
        select: {
            id: true,
            name: true,
            price: true,
            image: true,
            unit: true,
            slug: true,
            quantity: true,
            discount: true,
            original_price: true
        }
    });
};

module.exports = {
    findProductBySlug,
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getDetailProductBySlug,
    getCartProductModel
}