const multer = require('multer');
const path = require('path');
const fs = require('fs'); // <--- 1. Import thư viện quản lý file

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Đường dẫn nơi bạn muốn lưu ảnh
        // Bạn có thể đổi thành './uploads' nếu muốn đơn giản
        const uploadPath = './src/public/images'; 

        // <--- 2. KIỂM TRA VÀ TỰ TẠO THƯ MỤC NẾU CHƯA CÓ --->
        if (!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Đặt tên file ngẫu nhiên để không bị trùng
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Chỉ nhận ảnh
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

module.exports = upload;