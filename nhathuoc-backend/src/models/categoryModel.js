const {PrismaClient} = require('../generated/client');
const prisma = new PrismaClient();


const getAllCategory = async (data = {}) => { // Thêm = {} để tránh lỗi undefined
    return await prisma.category.findMany({
        ...data,
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: { id: 'desc' }
    });
};
const createCategory = async (data) => {
    return await prisma.category.create({
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description || null, // Thêm trường này
            image: data.image || null,             // Thêm trường này
            status: data.status !== undefined ? data.status : true 
        }
    });
};
const getCategoryById = async (id) =>{
    return await prisma.category.findUnique({
        where: {id: id},
        include: {
            _count: {
                select: { products: true } // Lấy kèm số lượng sản phẩm để hiển thị nếu cần
            }
        }
    })
}
// update
const updateCategory = async(id, data) =>{
    return await prisma.category.update({
        where: {id},
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description || null,
            image: data.image || null,
            status: data.status !== undefined ? data.status : true
        }
    })
}
const deleteCategory = async (id) => {
    return await prisma.category.delete({
        where: { id: parseInt(id) }
    });
};
module.exports ={
    getAllCategory,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
}
