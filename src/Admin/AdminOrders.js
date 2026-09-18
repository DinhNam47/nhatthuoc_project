import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import "./AdminOrders.css";

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchAdminOrders();
    }, []);

    const fetchAdminOrders = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        try {
            const res = await axios.get("http://localhost:3000/api/admin/orders", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data) {
                const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setOrders(list);
            }
        } catch (err) {
            console.error("Lỗi lấy danh sách đơn Admin:", err);
            toast.error(err.response?.data?.message || "Không thể tải danh sách đơn hàng!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newOrderStatus, newPaymentStatus) => {
        setIsUpdating(true);
        const token = localStorage.getItem("token");

        try {
            const res = await axios.put(
                `http://localhost:3000/api/admin/orders/${orderId}/status`,
                {
                    orderStatus: newOrderStatus,
                    paymentStatus: newPaymentStatus
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success("Cập nhật trạng thái thành công!");

            setOrders(prev =>
                prev.map(ord => (ord.id === orderId ? { ...ord, ...res.data.order } : ord))
            );

            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, ...res.data.order }));
            }
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái:", err);
            toast.error(err.response?.data?.message || "Cập nhật thất bại!");
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredOrders = useMemo(() => {
        if (filterStatus === "ALL") return orders;
        return orders.filter(item => item.orderStatus === filterStatus);
    }, [orders, filterStatus]);

    const formatPrice = (val) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(val) || 0);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    function renderOrdersTable() {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan="7" className="orders-empty-cell">
                        Đang tải danh sách đơn hàng...
                    </td>
                </tr>
            );
        }

        if (!filteredOrders || filteredOrders.length === 0) {
            return (
                <tr>
                    <td colSpan="7" className="orders-empty-cell">
                        Không có đơn hàng nào trong danh mục này...
                    </td>
                </tr>
            );
        }

        return filteredOrders.map((ord) => (
            <tr key={ord.id}>
                <td className="col-id">#{ord.id}</td>
                <td>
                    <div className="order-customer-box">
                        <span className="order-customer-name">{ord.receiverName}</span>
                        <span className="order-customer-phone">{ord.phoneNumber}</span>
                    </div>
                </td>
                <td className="col-date">{formatDate(ord.createdAt)}</td>
                <td className="col-price">{formatPrice(ord.totalAmount)}</td>
                <td>
                    <span className={`payment-pill ${ord.paymentStatus === "PAID" ? "paid" : "unpaid"}`}>
                        {ord.paymentMethod} • {ord.paymentStatus === "PAID" ? "Đã thu" : "Chưa thu"}
                    </span>
                </td>
                <td>
                    <select
                        className={`order-status-select ${ord.orderStatus.toLowerCase()}`}
                        value={ord.orderStatus}
                        disabled={isUpdating}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value, ord.paymentStatus)}
                    >
                        <option value="PENDING">Chờ xác nhận</option>
                        <option value="PROCESSING">Đang đóng gói</option>
                        <option value="SHIPPING">Đang giao hàng</option>
                        <option value="DELIVERED">Đã giao thành công</option>
                        <option value="CANCELLED">Hủy đơn hàng</option>
                    </select>
                </td>
                <td>
                    <button
                        className="btn-order-view"
                        title="Xem chi tiết đơn hàng"
                        onClick={() => setSelectedOrder(ord)}
                    >
                        <i className="fa-solid fa-eye"></i>
                    </button>
                </td>
            </tr>
        ));
    }

    return (
        <div className="orders-management-wrapper">
            <div className="orders-header-row">
                <div className="orders-header-text">
                    <h2 className="orders-page-title">Quản lý đơn hàng</h2>
                    <p className="orders-page-sub">Theo dõi, kiểm duyệt và cập nhật tình trạng giao nhận thuốc</p>
                </div>
                <button className="btn-order-refresh" onClick={fetchAdminOrders}>
                    <i className="fa-solid fa-rotate me-2"></i> Làm mới
                </button>
            </div>

            <div className="orders-tabs-card">
                <div className="orders-tabs-list">
                    {[
                        { key: "ALL", label: "Tất cả" },
                        { key: "PENDING", label: "Chờ xác nhận" },
                        { key: "PROCESSING", label: "Đang đóng gói" },
                        { key: "SHIPPING", label: "Đang giao" },
                        { key: "DELIVERED", label: "Đã giao" },
                        { key: "CANCELLED", label: "Đã hủy" }
                    ].map((tab) => {
                        const count = tab.key === "ALL"
                            ? orders.length
                            : orders.filter((o) => o.orderStatus === tab.key).length;

                        const isActive = filterStatus === tab.key;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                className={`order-tab-btn ${isActive ? "active" : ""}`}
                                onClick={() => setFilterStatus(tab.key)}
                            >
                                <span>{tab.label}</span>
                                <span className="order-tab-badge">{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <h3 className="orders-section-title">
                Danh sách đơn hàng ({filteredOrders.length})
            </h3>

            <div className="orders-table-card">
                <table className="orders-data-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Thanh toán</th>
                            <th>Trạng thái đơn</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>{renderOrdersTable()}</tbody>
                </table>
            </div>

            {selectedOrder && (
                <div className="orders-modal-backdrop" onClick={() => setSelectedOrder(null)}>
                    <div className="orders-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="orders-modal-top">
                            <h4 className="orders-modal-title">
                                <i className="fa-solid fa-file-invoice me-2"></i>
                                Chi tiết đơn hàng #{selectedOrder.id}
                            </h4>
                            <button
                                type="button"
                                className="orders-modal-close-btn"
                                onClick={() => setSelectedOrder(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="orders-modal-client-info">
                            <div className="info-row">
                                <strong>Người nhận:</strong> 
                                <span>{selectedOrder.receiverName} ({selectedOrder.phoneNumber})</span>
                            </div>
                            <div className="info-row">
                                <strong>Địa chỉ nhận:</strong> 
                                <span>{selectedOrder.shippingAddress}</span>
                            </div>
                            {selectedOrder.note && (
                                <div className="info-row">
                                    <strong>Ghi chú:</strong> 
                                    <span>{selectedOrder.note}</span>
                                </div>
                            )}
                            <div className="info-row">
                                <strong>Thanh toán:</strong> 
                                <span>{selectedOrder.paymentMethod}</span> • 
                                <span className={`modal-payment-tag ${selectedOrder.paymentStatus === "PAID" ? "paid" : "unpaid"}`}>
                                    {selectedOrder.paymentStatus === "PAID" ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
                                </span>
                            </div>
                        </div>

                        <h5 className="modal-items-heading">Sản phẩm trong đơn</h5>
                        <div className="modal-items-container">
                            {selectedOrder.items?.map((item, idx) => (
                                <div key={idx} className="modal-item-line">
                                    <div className="modal-item-info">
                                        <span className="modal-item-name">
                                            {item.product?.name || `Mã thuốc #${item.productId}`}
                                        </span>
                                        <small className="modal-item-qty">Số lượng: x{item.quantity}</small>
                                    </div>
                                    <span className="modal-item-subtotal">
                                        {formatPrice(Number(item.price) * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="modal-total-summary">
                            <span>Tổng giá trị đơn:</span>
                            <strong className="modal-total-number">
                                {formatPrice(selectedOrder.totalAmount)}
                            </strong>
                        </div>

                        <div className="modal-footer-actions">
                            {selectedOrder.paymentStatus !== "PAID" ? (
                                <button
                                    className="btn-modal-action mark-paid"
                                    onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.orderStatus, "PAID")}
                                >
                                    <i className="fa-solid fa-check me-2"></i>Đã thu tiền
                                </button>
                            ) : (
                                <button
                                    className="btn-modal-action mark-unpaid"
                                    onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.orderStatus, "UNPAID")}
                                >
                                    <i className="fa-solid fa-xmark me-2"></i>Chưa thu tiền
                                </button>
                            )}

                            <button
                                className="btn-modal-action close"
                                onClick={() => setSelectedOrder(null)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminOrders;