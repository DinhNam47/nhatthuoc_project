import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

function Header() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Kiểm tra trạng thái đăng nhập khi Header load lại
    useEffect(() => {
        const userData = localStorage.getItem("auth");
        if (userData) {
            try {
                setAuth(JSON.parse(userData));
            } catch (e) {
                console.error("Lỗi parse dữ liệu auth:", e);
            }
        }
    }, []);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Hàm đăng xuất
    function handleLogout() {
        setIsDropdownOpen(false);
        Swal.fire({
            title: 'Bạn muốn đăng xuất?',
            text: "Bạn sẽ cần đăng nhập lại để xem giỏ hàng và đơn hàng!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2d8a4e',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý, thoát!',
            cancelButtonText: 'Ở lại'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                localStorage.removeItem('auth');
                setAuth(null);
                toast.success("Đã đăng xuất!");
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            }
        });
    }

    // Cập nhật số lượng icon giỏ hàng
    const [cartCount, setCartCount] = useState(0);
    useEffect(() => {
        updateCartCount();

        const handleStorageChange = () => {
            updateCartCount();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        const total = Object.values(cart).reduce((sum, qty) => sum + Number(qty), 0);
        setCartCount(total);
    };

    // Hàm render khu vực User với Dropdown menu
    // Trong Header.jsx -> hàm renderLogin:
function renderLogin() {
    const token = localStorage.getItem("token");
    if (token && auth) {
        return (
            <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
                <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        backgroundColor: isDropdownOpen ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        color: '#ffffff',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <i className="fa-solid fa-circle-user" style={{ fontSize: '20px' }} />
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                        {auth.fullName || 'Tài khoản'}
                    </span>
                    <i
                        className="fa-solid fa-chevron-down"
                        style={{
                            fontSize: '11px',
                            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                        }}
                    />
                </button>

                {/* SỬ DỤNG CLASS .user-dropdown-menu */}
                {isDropdownOpen && (
                    <ul className="user-dropdown-menu">
                        {auth.role && auth.role.toLowerCase() === 'admin' && (
                            <li>
                                <Link
                                    to="/admin/users"
                                    onClick={() => setIsDropdownOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 16px',
                                        color: '#0f172a',
                                        textDecoration: 'none',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        backgroundColor: '#f8fafc'
                                    }}
                                >
                                    <i className="fa-solid fa-gauge-high" style={{ color: '#2563eb', width: '16px' }} />
                                    <span>Trang Quản Trị</span>
                                </Link>
                            </li>
                        )}

                        <li>
                            <Link
                                to="/profile"
                                onClick={() => setIsDropdownOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 16px',
                                    color: '#334155',
                                    textDecoration: 'none',
                                    fontSize: '13px'
                                }}
                            >
                                <i className="fa-regular fa-id-badge" style={{ color: '#64748b', width: '16px' }} />
                                <span>Thông tin tài khoản</span>
                            </Link>
                        </li>

                        <li>
                            <Link
                                to="/my-orders"
                                onClick={() => setIsDropdownOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 16px',
                                    color: '#334155',
                                    textDecoration: 'none',
                                    fontSize: '13px'
                                }}
                            >
                                <i className="fa-solid fa-box-archive" style={{ color: '#2d8a4e', width: '16px' }} />
                                <span>Đơn hàng của tôi</span>
                            </Link>
                        </li>

                        <li style={{ borderTop: '1px solid #f1f5f9', margin: '6px 0' }} />

                        <li>
                            <a
                                onClick={handleLogout}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 16px',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                }}
                            >
                                <i className="fa-solid fa-arrow-right-from-bracket" style={{ color: '#dc2626', width: '16px' }} />
                                <span>Đăng xuất</span>
                            </a>
                        </li>
                    </ul>
                )}
            </div>
        );
    }
    // ... phần chưa đăng nhập giữ nguyên
}

    return (
        <>
            {/* 1. HEADER QUẢNG CÁO TOP */}
            <div className="top-banner-ad">
                <div className="container">
                    <span>🎉 Giảm ngay 50K cho đơn hàng đầu tiên - Nhập mã: <strong>CHAOBANMOI</strong></span>
                </div>
            </div>

            {/* 2. HEADER CHÍNH */}
            <header className="main-header">
                <div className="container header-wrapper">
                    {/* Mobile Toggle */}
                    <div className="mobile-toggle">
                        <i className="fa-solid fa-bars" />
                    </div>

                    {/* Logo */}
                    <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
                        <div className="logo-icon"><i className="fa-solid fa-plus" /></div>
                        <div className="logo-text">
                            <span className="brand-name">MEDIPHARMA</span>
                            <span className="brand-slogan">Sức khỏe là vàng</span>
                        </div>
                    </Link>

                    {/* Search Bar */}
                    <div className="search-area">
                        <form className="search-form">
                            <input type="text" placeholder="Tìm tên thuốc, bệnh lý, thực phẩm chức năng..." />
                            <button type="submit"><i className="fa-solid fa-magnifying-glass" /></button>
                        </form>
                        <div className="search-tags">
                            <a href="#">Panadol</a>
                            <a href="#">Khẩu trang</a>
                            <a href="#">Vitamin C</a>
                            <a href="#">Collagen</a>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="header-actions">
                        <a href="#" className="action-btn upload-rx">
                            <i className="fa-solid fa-camera" />
                            <span>Đăng tải<br />đơn thuốc</span>
                        </a>
                        <a href="#" className="action-btn">
                            <i className="fa-regular fa-bell" />
                            <span>Thông báo</span>
                        </a>
                        <Link to="/cart" className="action-btn cart-btn">
                            <div className="icon-wrap">
                                <i className="fa-solid fa-cart-shopping" />
                                <span className="badge">{cartCount}</span>
                            </div>
                            <span>Giỏ hàng</span>
                        </Link>

                        {/* GỌI HÀM RENDER DROPDOWN USER */}
                        {renderLogin()}
                    </div>
                </div>
            </header>

            {/* 3. NAVIGATION MENU */}
            <nav className="main-nav">
                <div className="container nav-container">
                    <div className="category-menu">
                        <i className="fa-solid fa-bars" /> DANH MỤC SẢN PHẨM
                        <div className="dropdown-content">
                            <a href="#"><i className="fa-solid fa-pills" /> Thuốc</a>
                            <a href="#"><i className="fa-solid fa-flask" /> Thực phẩm chức năng</a>
                            <a href="#"><i className="fa-solid fa-pump-medical" /> Dược mỹ phẩm</a>
                            <a href="#"><i className="fa-solid fa-baby" /> Mẹ và Bé</a>
                            <a href="#"><i className="fa-solid fa-heart-pulse" /> Thiết bị y tế</a>
                            <a href="#"><i className="fa-solid fa-hand-holding-medical" /> Chăm sóc cá nhân</a>
                        </div>
                    </div>
                    <ul className="nav-links">
                        <li><Link to="/" className="active">Trang chủ</Link></li>
                        <li><a href="#"><i className="fa-solid fa-virus-covid" /> Tiêm chủng</a></li>
                        <li><a href="#">Bệnh &amp; Thuốc</a></li>
                        <li><a href="#">Góc sức khỏe</a></li>
                        <li><a href="#">Hệ thống nhà thuốc</a></li>
                        <li><a href="#" className="highlight-text">Tư vấn trực tuyến</a></li>
                    </ul>
                </div>
            </nav>
        </>
    );
}

export default Header;