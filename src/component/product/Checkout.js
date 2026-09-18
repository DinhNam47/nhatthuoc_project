import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Checkout.css';

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();

    const checkoutData = location.state || { items: [], totalAmount: 0 };
    const { items, totalAmount } = checkoutData;

    const [formData, setFormData] = useState({
        receiverName: '',
        phoneNumber: '',
        shippingAddress: '',
        note: '',
        paymentMethod: 'COD'
    });

    // Quản lý lỗi riêng cho từng trường input
    const [fieldErrors, setFieldErrors] = useState({});
    // Quản lý lỗi chung (lỗi mạng, lỗi server, lỗi nghiệp vụ)
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successOrder, setSuccessOrder] = useState(null);

    // Kiểm tra tính hợp lệ của giỏ hàng khi vừa vào trang
    useEffect(() => {
        if (!items || items.length === 0) {
            navigate('/cart');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để tiến hành đặt hàng!');
            navigate('/login');
        }
    }, [items, navigate]);

    // Xử lý thay đổi dữ liệu và xóa lỗi của trường đó theo thời gian thực
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Hàm validate toàn bộ form trước khi gửi API
    const validateForm = () => {
        const errors = {};
        const vnf_regex = /^(0[3|5|7|8|9])[0-9]{8}$/; // Chuẩn số điện thoại VN 10 số

        if (!formData.receiverName.trim()) {
            errors.receiverName = 'Vui lòng nhập họ và tên người nhận.';
        } else if (formData.receiverName.trim().length < 2) {
            errors.receiverName = 'Họ tên quá ngắn (tối thiểu 2 ký tự).';
        }

        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'Vui lòng nhập số điện thoại liên hệ.';
        } else if (!vnf_regex.test(formData.phoneNumber.trim())) {
            errors.phoneNumber = 'Số điện thoại không hợp lệ (VD: 0912345678).';
        }

        if (!formData.shippingAddress.trim()) {
            errors.shippingAddress = 'Vui lòng nhập địa chỉ giao hàng cụ thể.';
        } else if (formData.shippingAddress.trim().length < 10) {
            errors.shippingAddress = 'Địa chỉ quá ngắn. Vui lòng ghi rõ số nhà, đường, phường/xã.';
        }

        if (!['COD', 'VNPAY'].includes(formData.paymentMethod)) {
            errors.paymentMethod = 'Phương thức thanh toán không hợp lệ.';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        // 1. Chạy validate client
        if (!validateForm()) {
            return;
        }

        // 2. Kiểm tra token đăng nhập
        const token = localStorage.getItem('token');
        if (!token) {
            setServerError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        // 3. Kiểm tra lại giỏ hàng phòng trường hợp rỗng
        if (!items || items.length === 0) {
            setServerError('Đơn hàng không có sản phẩm nào để xử lý.');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                receiverName: formData.receiverName.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                shippingAddress: formData.shippingAddress.trim(),
                note: formData.note.trim(),
                paymentMethod: formData.paymentMethod,
                totalAmount: Number(totalAmount),
                items: items.map((item) => ({
                    productId: parseInt(item.id),
                    quantity: parseInt(item.qty),
                    price: Number(item.price)
                }))
            };

            const res = await axios.post('http://localhost:3000/api/orders', payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.status === 201 || res.status === 200) {
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('storage'));
                setSuccessOrder(res.data.order);
            }
        } catch (err) {
            console.error('Lỗi khi submit đơn hàng:', err);

            if (!err.response) {
                setServerError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng!');
            } else if (err.response.status === 401 || err.response.status === 403) {
                setServerError('Phiên làm việc hết hạn hoặc bạn không có quyền đặt đơn. Vui lòng đăng nhập lại.');
            } else if (err.response.status === 400) {
                // Nhận thông báo lỗi trực tiếp từ OrderModel (ví dụ: sản phẩm hết kho)
                setServerError(err.response.data?.message || 'Dữ liệu đơn hàng không hợp lệ.');
            } else {
                setServerError(err.response.data?.message || 'Đã có lỗi xảy ra phía máy chủ, vui lòng thử lại sau.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const getImgUrl = (img) =>
        img ? `http://localhost:3000/images/${img}` : 'https://placehold.co/70?text=No+Img';

    if (successOrder) {
        return (
            <div className="checkout-success-container">
                <div className="checkout-success-card">
                    <div className="success-icon">&#10004;</div>
                    <h2>Đặt hàng thành công!</h2>
                    <p>Mã đơn hàng của bạn: <strong>#{successOrder.id}</strong></p>
                    <p className="sub-text">
                        Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được tiếp nhận và xử lý.
                    </p>
                    <div className="success-actions">
                        <Link to="/" className="btn-home">Tiếp tục mua sắm</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <h2 className="page-title">Thanh toán đơn hàng</h2>

                <form onSubmit={handleSubmit} className="checkout-grid" noValidate>
                    {/* Cột trái: Thông tin nhận hàng & phương thức thanh toán */}
                    <div className="checkout-form-section">
                        <div className="box-card">
                            <h3 className="section-title">1. Thông tin người nhận</h3>

                            <div className="form-group">
                                <label>Họ và tên người nhận *</label>
                                <input
                                    type="text"
                                    name="receiverName"
                                    placeholder="Nguyễn Văn A"
                                    value={formData.receiverName}
                                    onChange={handleChange}
                                    className={fieldErrors.receiverName ? 'input-error' : ''}
                                />
                                {fieldErrors.receiverName && (
                                    <span className="field-error-text">{fieldErrors.receiverName}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Số điện thoại liên hệ *</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="0912345678"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className={fieldErrors.phoneNumber ? 'input-error' : ''}
                                />
                                {fieldErrors.phoneNumber && (
                                    <span className="field-error-text">{fieldErrors.phoneNumber}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Địa chỉ nhận hàng cụ thể *</label>
                                <input
                                    type="text"
                                    name="shippingAddress"
                                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                                    value={formData.shippingAddress}
                                    onChange={handleChange}
                                    className={fieldErrors.shippingAddress ? 'input-error' : ''}
                                />
                                {fieldErrors.shippingAddress && (
                                    <span className="field-error-text">{fieldErrors.shippingAddress}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Ghi chú đơn hàng (Tùy chọn)</label>
                                <textarea
                                    name="note"
                                    rows="3"
                                    placeholder="Giao hàng giờ hành chính, gọi trước khi giao..."
                                    value={formData.note}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                        </div>

                        <div className="box-card">
                            <h3 className="section-title">2. Phương thức thanh toán</h3>

                            <label className={`payment-option ${formData.paymentMethod === 'COD' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="COD"
                                    checked={formData.paymentMethod === 'COD'}
                                    onChange={handleChange}
                                />
                                <div className="payment-desc">
                                    <strong>Thanh toán tiền mặt khi nhận hàng (COD)</strong>
                                    <span>Kiểm tra hàng trước khi gửi tiền cho nhân viên bưu tá</span>
                                </div>
                            </label>

                            <label className={`payment-option ${formData.paymentMethod === 'VNPAY' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="VNPAY"
                                    checked={formData.paymentMethod === 'VNPAY'}
                                    onChange={handleChange}
                                />
                                <div className="payment-desc">
                                    <strong>Thanh toán chuyển khoản / VNPAY QR</strong>
                                    <span>Quét mã QR qua ứng dụng ngân hàng</span>
                                </div>
                            </label>
                            {fieldErrors.paymentMethod && (
                                <span className="field-error-text">{fieldErrors.paymentMethod}</span>
                            )}
                        </div>
                    </div>

                    {/* Cột phải: Tóm tắt đơn hàng & nút submit */}
                    <div className="checkout-summary-section">
                        <div className="box-card summary-card">
                            <h3 className="section-title">Tóm tắt đơn hàng ({items.length} món)</h3>

                            <div className="checkout-item-list">
                                {items.map((item) => (
                                    <div key={item.id} className="checkout-item">
                                        <img src={getImgUrl(item.image)} alt={item.name} />
                                        <div className="item-info">
                                            <div className="item-name">{item.name}</div>
                                            <div className="item-meta">
                                                <span>SL: {item.qty}</span>
                                                <span className="item-price">{formatPrice(item.price * item.qty)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="price-breakdown">
                                <div className="row-cost">
                                    <span>Tạm tính</span>
                                    <span>{formatPrice(totalAmount)}</span>
                                </div>
                                <div className="row-cost">
                                    <span>Phí vận chuyển</span>
                                    <span className="free-shipping">Miễn phí</span>
                                </div>
                                <div className="row-cost total">
                                    <span>Tổng thanh toán</span>
                                    <span className="price-total">{formatPrice(totalAmount)}</span>
                                </div>
                            </div>

                            {/* Hiển thị lỗi từ backend nếu có */}
                            {serverError && (
                                <div className="checkout-error">
                                    &#9888; {serverError}
                                </div>
                            )}

                            <button type="submit" className="btn-place-order" disabled={isLoading}>
                                {isLoading ? 'ĐANG TIẾP NHẬN...' : 'XÁC NHẬN ĐẶT HÀNG'}
                            </button>

                            <Link to="/cart" className="back-cart-link">
                                &larr; Quay lại giỏ hàng
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Checkout;