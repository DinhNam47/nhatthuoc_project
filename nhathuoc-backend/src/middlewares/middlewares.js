const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Lấy chuỗi từ header
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: "Bạn cần đăng nhập!" });
    }

    try {
        // 2. TÁCH CHUỖI: Nếu có chữ "Bearer ", lấy phần phía sau. Nếu không, lấy cả.
        const token = authHeader.startsWith('Bearer ') 
                      ? authHeader.split(' ')[1] 
                      : authHeader;

        // 3. Kiểm tra token
        const decoded = jwt.verify(token, 'bi_mat_nha_thuoc_2026');

        req.user = decoded;
        next();
    } catch (err) {
        // Lỗi này sẽ bắn ra nếu token sai hoặc hết hạn
        return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};

module.exports = verifyToken;