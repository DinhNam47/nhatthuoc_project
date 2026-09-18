import React from 'react';
import { Link,  useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

function AdminLayout({ children }) {
    const location = useLocation(); // Dùng để xác định trang đang đứng để làm sáng menu

    // Lấy thông tin tài khoản từ localStorage sau khi đăng nhập thành công
    const auth = JSON.parse(localStorage.getItem("auth"));

    // const handleLogout = () => {
    //     if (window.confirm("Bạn có chắc chắn muốn thoát khỏi trang quản trị?")) {
    //         localStorage.clear();
    //         toast.success("Đã đăng xuất tài khoản Admin");
    //         window.location.href = "/login";
    //     }
    // };
    function handleLogout() {
            Swal.fire({
                title: 'Bạn có chắc chắn muốn thoát khỏi trang quản trị?',
                text: "Bạn sẽ cần đăng nhập lại để Quản trị!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#2d8a4e', // Màu xanh MediPharma
                cancelButtonColor: '#d33',
                confirmButtonText: 'Đồng ý, thoát!',
                cancelButtonText: 'Ở lại'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.clear();
                    toast.success("Đã đăng xuất tài khoản Admin");
                    window.location.href = "/login";
                }
            });
        }
    return (
        <div className="admin-layout">
            {/* 1. SIDEBAR TỐI MÀU (DARK SIDEBAR) */}
            <aside className="admin-sidebar">
                <div className="admin-logo-area">
                    <div className="logo-icon"><i className="fa-solid fa-leaf" /></div>
                    <span>MEDIGREEN <strong>ADMIN</strong></span>
                </div>
                
                <nav className="admin-nav">
                    <ul>
                        {/* Kiểm tra location.pathname để thêm class 'active' giúp menu sáng lên */}
                        <li className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
                            <Link to="/admin/dashboard">
                                <i className="fa-solid fa-chart-pie" /> Dashboard
                            </Link>
                        </li>
                        <li className={location.pathname === '/admin/products' ? 'active' : ''}>
                            <Link to="/admin/products">
                                <i className="fa-solid fa-pills" /> Quản lý thuốc
                            </Link>
                        </li>
                        <li className={location.pathname === '/admin/orders' ? 'active' : ''}>
                            <Link to="/admin/orders">
                                <i className="fa-solid fa-receipt" /> Đơn hàng
                            </Link>
                        </li>
                        <li className={location.pathname === '/admin/users' ? 'active' : ''}>
                            <Link to="/admin/users">
                                <i className="fa-solid fa-user-shield" /> Quản lý Tài khoản
                            </Link>
                        </li>
                        <li className={location.pathname === '/adimn/category' ? 'active' : ''}>
                            <Link to="/admin/category">
                                <i className="fa-solid fa-tags" /> Quản lý Danh Mục
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <Link to="/">
                        <i className="fa-solid fa-house-user" /> Về trang chủ
                    </Link>
                </div>
            </aside>

            {/* 2. PHẦN CHÍNH BÊN PHẢI (MAIN CONTENT) */}
            <section className="admin-main">
                {/* HEADER TỐI MÀU ĐỒNG BỘ */}
                <header className="admin-top-header">
                    <div className="header-left">
                        {/* THANH TÌM KIẾM HIỆN ĐẠI */}
                        <div className="admin-search-wrapper">
                            <i className="fa-solid fa-magnifying-glass" />
                            <input type="text" placeholder="Tìm nhanh thuốc, hóa đơn..." />
                        </div>
                    </div>

                    <div className="header-right">
                        {/* BIỂU TƯỢNG THÔNG BÁO */}
                        <div className="admin-notifications">
                            <i className="fa-regular fa-bell" />
                            <span className="notif-dot" />
                        </div>
                        
                        {/* THÔNG TIN USER TỪ DATABASE */}
                        <div className="admin-user-profile">
                            <div className="user-text">
                                <p className="u-name">{auth?.fullName || "Quản trị viên"}</p>
                                <p className="u-role">Admin Hệ Thống</p>
                            </div>
                            <div className="user-avatar-circle">
                                {auth?.fullName?.charAt(0) || "A"}
                            </div>
                            <button onClick={handleLogout} className="logout-icon-btn" title="Đăng xuất">
                                <i className="fa-solid fa-power-off" />
                            </button>
                        </div>
                    </div>
                </header>
                
                {/* NƠI HIỂN THỊ NỘI DUNG CÁC TRANG QUẢN LÝ */}
                <div className="admin-body-content">
                    {children}
                </div>
            </section>
        </div>
    );
}

export default AdminLayout;