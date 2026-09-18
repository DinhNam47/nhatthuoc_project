const orderModel = require('../models/orderModel');

// 1. Đặt hàng (Checkout)
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ middleware verifyToken
    const {
      receiverName,
      phoneNumber,
      shippingAddress,
      note,
      paymentMethod,
      items,
      totalAmount
    } = req.body;

    // Validate dữ liệu đầu vào cơ bản
    if (!receiverName || !phoneNumber || !shippingAddress) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ tên người nhận, số điện thoại và địa chỉ giao hàng." });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng không có sản phẩm nào để thanh toán." });
    }

    if (!totalAmount) {
      return res.status(400).json({ message: "Tổng tiền đơn hàng không hợp lệ." });
    }

    const newOrder = await orderModel.createOrder({
      userId,
      receiverName,
      phoneNumber,
      shippingAddress,
      note,
      paymentMethod,
      items,
      totalAmount
    });

    return res.status(201).json({
      message: "Đặt hàng thành công!",
      order: newOrder
    });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    return res.status(400).json({
      message: error.message || "Không thể tạo đơn hàng, vui lòng thử lại."
    });
  }
};

// 2. Lấy danh sách đơn hàng của người dùng hiện tại
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel.getOrdersByUserId(userId);
    return res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn hàng:", error);
    return res.status(500).json({ message: "Lỗi server khi lấy lịch sử đơn hàng." });
  }
};

// 3. Xem chi tiết một đơn hàng theo ID
const getOrderDetail = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ." });
    }

    const order = await orderModel.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng này." });
    }

    // Kiểm tra quyền: Chỉ chủ đơn hàng hoặc ADMIN mới được xem
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập đơn hàng này." });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Lỗi lấy chi tiết đơn hàng:", error);
    return res.status(500).json({ message: "Lỗi server khi tải thông tin đơn hàng." });
  }
};

// 4. Lấy tất cả đơn hàng (Dành cho Quản trị viên)
const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Staff') {
      return res.status(403).json({ message: "Chức năng chỉ dành cho quản trị viên hoặc nhân viên." });
    }

    const orders = await orderModel.getAllOrders();
    return res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi lấy toàn bộ đơn hàng:", error);
    return res.status(500).json({ message: "Lỗi server khi lấy danh sách đơn hàng." });
  }
};

// 5. Cập nhật trạng thái đơn hàng (Dành cho Quản trị viên/Nhân viên)
const updateStatus = async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Staff') {
      return res.status(403).json({ message: "Chức năng chỉ dành cho quản trị viên hoặc nhân viên." });
    }

    const orderId = parseInt(req.params.id);
    const { orderStatus, paymentStatus } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ." });
    }

    const updatedOrder = await orderModel.updateOrderStatus(orderId, orderStatus, paymentStatus);

    return res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công!",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái đơn:", error);
    return res.status(500).json({ message: "Không thể cập nhật trạng thái đơn hàng." });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetail,
  getAllOrders,
  updateStatus
};