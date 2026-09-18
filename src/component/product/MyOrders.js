import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './MyOrders.css';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const statusTabs = [
        { key: 'ALL', label: 'Tất cả' },
        { key: 'PENDING', label: 'Chờ xác nhận' },
        { key: 'PROCESSING', label: 'Đang xử lý' },
        { key: 'SHIPPING', label: 'Đang giao' },
        { key: 'DELIVERED', label: 'Đã giao' },
        { key: 'CANCELLED', label: 'Đã hủy' }
    ];

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await axios.get('http://localhost:3000/api/orders/my-orders', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setOrders(data);
        } catch (err) {
            console.error("Lỗi lấy danh sách đơn:", err);
            setError(err.response?.data?.message || "Không thể tải danh sách đơn hàng.");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        if (selectedStatus === 'ALL') return orders;
        return orders.filter((order) => {
            const currentStatus = (order.orderStatus || order.status || '').toUpperCase();
            return currentStatus === selectedStatus;
        });
    }, [orders, selectedStatus]);

    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStatusBadge = (order) => {
        const rawStatus = order.orderStatus || order.status || 'PENDING';
        const s = String(rawStatus).trim().toUpperCase();

        switch (s) {
            case 'PENDING':
                return <span className="order-status-badge badge-pending">Chờ xác nhận</span>;
            case 'PROCESSING':
                return <span className="order-status-badge badge-processing">Đang đóng gói</span>;
            case 'SHIPPING':
                return <span className="order-status-badge badge-shipping">Đang giao hàng</span>;
            case 'DELIVERED':
                return <span className="order-status-badge badge-delivered">Giao thành công</span>;
            case 'CANCELLED':
                return <span className="order-status-badge badge-cancelled">Đã hủy</span>;
            default:
                return <span className="order-status-badge badge-default">{rawStatus}</span>;
        }
    };

    const getImgUrl = (img) =>
        img ? `http://localhost:3000/images/${img}` : 'https://placehold.co/70?text=Thuoc';

    if (isLoading) {
        return (
            <div className="orders-page">
                <div className="orders-container">
                    <div className="orders-loading">
                        <div className="orders-spinner"></div>
                        <p>Đang tải danh sách đơn hàng của bạn...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="orders-container">
                <div className="orders-header">
                    <h2>Đơn hàng của tôi</h2>
                    <p>Quản lý và theo dõi tiến trình giao nhận các sản phẩm bạn đã đặt mua.</p>
                </div>

                {error && <div className="alert-error">{error}</div>}

                {/* THANH TABS LỌC TRẠNG THÁI */}
                <div className="order-status-tabs">
                    {statusTabs.map((tab) => {
                        const count = tab.key === 'ALL'
                            ? orders.length
                            : orders.filter((o) => (o.orderStatus || o.status || '').toUpperCase() === tab.key).length;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                className={`tab-btn ${selectedStatus === tab.key ? 'active' : ''}`}
                                onClick={() => setSelectedStatus(tab.key)}
                            >
                                <span>{tab.label}</span>
                                <span className="tab-badge">{count}</span>
                            </button>
                        );
                    })}
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="empty-orders-card">
                        <div className="empty-icon">&#128230;</div>
                        <h3>Chưa tìm thấy đơn hàng</h3>
                        <p>
                            {selectedStatus === 'ALL'
                                ? 'Bạn chưa có đơn hàng nào trong lịch sử tài khoản.'
                                : 'Không có đơn hàng nào khớp với danh mục trạng thái này.'}
                        </p>
                        {selectedStatus !== 'ALL' ? (
                            <button onClick={() => setSelectedStatus('ALL')} className="btn-shop-now">
                                Xem tất cả đơn
                            </button>
                        ) : (
                            <Link to="/" className="btn-shop-now">Mua sắm ngay</Link>
                        )}
                    </div>
                ) : (
                    <div className="orders-list">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="order-card">
                                {/* Header của từng Order */}
                                <div className="order-card-header">
                                    <div className="order-meta">
                                        <span className="order-id">Mã đơn: #{order.id}</span>
                                        <span className="order-date">Đặt lúc: {formatDate(order.createdAt)}</span>
                                    </div>
                                    <div className="order-status-box">
                                        {renderStatusBadge(order)}
                                    </div>
                                </div>

                                {/* Danh sách sản phẩm thuộc Order */}
                                <div className="order-items-list">
                                    {order.items?.map((item) => (
                                        <div key={item.id} className="order-item-row">
                                            <img
                                                src={getImgUrl(item.product?.image)}
                                                alt={item.product?.name || 'Sản phẩm'}
                                                className="order-item-img"
                                            />
                                            <div className="order-item-details">
                                                <h4>{item.product?.name || `Mã thuốc #${item.productId}`}</h4>
                                                <p className="order-item-unit">Đơn vị: {item.product?.unit || 'Hộp'}</p>
                                                <div className="order-item-qty-price">
                                                    <span>Số lượng: x{item.quantity}</span>
                                                    <span className="price">{formatPrice(Number(item.price) * item.quantity)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Thông tin nhận hàng & Tổng tiền */}
                                <div className="order-card-footer">
                                    <div className="shipping-summary">
                                        <p><strong>Người nhận:</strong> {order.receiverName} ({order.phoneNumber})</p>
                                        <p><strong>Địa chỉ:</strong> {order.shippingAddress}</p>
                                        {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}
                                        <p>
                                            <strong>Thanh toán:</strong> {order.paymentMethod} (
                                            <span className={order.paymentStatus === 'PAID' ? 'text-paid' : 'text-unpaid'}>
                                                {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                            </span>)
                                        </p>
                                    </div>

                                    <div className="total-summary">
                                        <span className="total-label">Tổng thanh toán:</span>
                                        <span className="total-amount">{formatPrice(order.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyOrders;