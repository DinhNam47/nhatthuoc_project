const categoryModel = require('../models/categoryModel')

const getAllCategory = async (req, res) => {
    try {
        // Gọi hàm getAll() từ model (không cần truyền biến 'data' vì lấy tất cả)
        const category = await categoryModel.getAllCategory(); 
            return res.status(200).json({
            errCode: 0,
            data: category
        });
    } catch (e) {
        console.log("Lỗi tại getAllCategory:", e);
        return res.status(500).json({ 
            errCode: -1, 
            message: "Lỗi Server không thể lấy danh mục" 
        });
    }
}
const createCategory = async (req, res) => {
    try {
        const { name, slug, status, description, image } = req.body;
        const category = await categoryModel.createCategory({
            name,
            slug,
            status,
            description,
            image
        });
        return res.status(200).json({
            errCode: 0,
            message: "Thêm danh mục thành công!",
            data: category
        });

    } catch (e) {
        console.log("Lỗi tại createCategory:", e);
        return res.status(500).json({ 
            errCode: -1, 
            message: "Lỗi Server hoặc dữ liệu đã tồn tại" 
        });
    }
};

// lây 1 thông tin 
const getCategoryById = async(req, res)=>{
    try{
        const id = parseInt(req.params.id);
        const category = await categoryModel.getCategoryById(id)
        if(!category) return res.status(404).json({errCode: 0, message:'Không tìm thấy thuốc này!'});
            return res.status(200).json({ errCode: 0, message: 'Ok', data: category });
        }catch(error){
            return res.status(500).json({ errCode: -1, message: 'Lỗi server' });
    }

}
// sửa 1 category
const updateCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, slug, description, image, status } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                errCode: 1,
                message: "Tên và Slug không được để trống!"
            });
        }

        const existCategory = await categoryModel.getCategoryById(id);
        if (!existCategory) {
            return res.status(404).json({
                errCode: 2,
                message: "Danh mục không tồn tại!"
            });
        }

        const category = await categoryModel.updateCategory(id, {
            name,
            slug,
            description,
            image,
            status
        });

        return res.status(200).json({
            errCode: 0,
            message: "Cập nhật danh mục thành công!",
            data: category
        });
    } catch (e) {
        console.error("Lỗi updateCategory:", e);
        return res.status(500).json({
            errCode: -1,
            message: "Lỗi Server hoặc Slug bị trùng"
        });
    }
};
// xóa
const deleteCategory = async(req,res) =>{
    try {
        const id = parseInt(req.params.id);

        // 1. Kiểm tra an toàn: Đảm bảo danh mục không còn thuốc mới cho phép xóa
        const check = await categoryModel.getCategoryById(id);
        if (check && check._count.products > 0) {
            return res.json({
                errCode: 2,
                message: `Không thể xóa! Danh mục này còn ${check._count.products} sản phẩm.`
            });
        }

        // 2. Gọi đúng hàm xóa của Category Model
        await categoryModel.deleteCategory(id);

        return res.json({ 
            errCode: 0,
            message: "Đã xóa danh mục thành công" 
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: "Lỗi Server" });
    }
}

module.exports ={
getAllCategory,
createCategory,
getCategoryById,
updateCategory,
deleteCategory
}