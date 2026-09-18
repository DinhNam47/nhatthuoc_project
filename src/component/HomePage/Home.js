import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Blog from '../blog/Blog';

function Home() {
    // 1. STATE LƯU DỮ LIỆU
    const [flashSaleProducts, setFlashSaleProducts] = useState([]);
    const [tpcnProducts, setTpcnProducts] = useState([]);
    // 2. GỌI API KHI LOAD TRANG
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resFlash, resTpcn] = await Promise.all([
                    // API 1: Lấy 4 sản phẩm Flash Sale
                    axios.get('http://localhost:3000/api/products?flashSale=true&limit=4'),
                    // API 2: Lấy 10 sản phẩm TPCN (Hoặc sản phẩm mới)
                    axios.get('http://localhost:3000/api/products?limit=10')
                ]);

                if (resFlash.data && resFlash.data.errCode === 0) {
                    setFlashSaleProducts(resFlash.data.data);
                }
                if (resTpcn.data && resTpcn.data.errCode === 0) {
                    setTpcnProducts(resTpcn.data.data);
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            }
        };
        fetchData();
    }, []);
    // 3. CÁC HÀM BỔ TRỢ (HELPER)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    const getImageUrl = (item) => {
        if (item.image) return `http://localhost:3000/images/${item.image}`;
        if (item.gallery) {
            try {
                const images = JSON.parse(item.gallery);
                if (images.length > 0) return `http://localhost:3000/images/${images[0]}`;
            } catch (e) {}
        }
        return "https://placehold.co/200x200/f5f5f5/999?text=No+Image";
    };
    const renderData = (list, isSimple = false) => {
        if (!list || list.length === 0) {
            return <p style={{padding: '20px', color: '#666'}}>Đang tải sản phẩm...</p>;
        }

        return list.map((item, index) => {
            // Tính giá cũ để hiển thị gạch ngang
            const oldPrice = item.original_price || (item.discount > 0 ? (item.price * 100) / (100 - item.discount) : 0);

            // --- TRƯỜNG HỢP 1: GIAO DIỆN ĐƠN GIẢN (TPCN) ---
            if (isSimple) {
                return (
                    <div className="product-card simple">
                            <div className="product-img">
                                <img src= {getImageUrl(item)} alt="SP" />
                            </div>
                            <div className="product-details">
                               <Link to={`/san-pham/${item.slug}`}>{item.name}</Link>
                                <div className="p-price-row">
                                    <span className="new">{formatCurrency(item.price)}</span>
                                    <span className="unit">/ {item.unit}</span>
                                </div>
                               <div className='view-detail-btn-simple'>
                                    <Link to={`/product/detail/${item.slug}`} >Xem chi tiết</Link>
                               </div>
                            </div>
                        </div>
                );
            }

            // --- TRƯỜNG HỢP 2: GIAO DIỆN ĐẦY ĐỦ (FLASH SALE) ---
            return (
                <div className="product-card">
                            <div className="badge-discount">{item.discount}%</div>
                            <div className="product-img">
                                <img src={getImageUrl(item)} alt={item.name} />
                            </div>
                            <div className="product-details">
                                <Link to={`/san-pham/${item.slug}`}>{item.name}</Link>
                                <div className="p-price">
                                    <span className="new">{formatCurrency(item.price)}</span>
                                    <span className="old">{formatCurrency(oldPrice)}</span>
                                </div>
                                <div className="sold-progress">
                                    <div className="bar" style={{ width: `${item.quantity < 10 ? 90 : 40}%` }} />
                                    <span>Đã bán {item.quantity < 50 ? 'Nhiều' : 'Ít'}</span>
                                </div>
                                {/* NÚT MỚI THÊM VÀO ĐÂY: Dùng div bao quanh để dàn hàng ngang */}
                                <div className="product-actions">
                                    {/* SỬA DÒNG NÀY: Thay button bằng Link */}
                                    <Link to={`/product/detail/${item.slug}`} className="view-detail-btn">
                                        Xem chi tiết
                                    </Link>   
                                    <button className="add-cart-btn">Thêm vào giỏ</button>
                                </div>
                            </div>
                        </div>
            );
        });
    };
    return (
        <div className="home-page-wrapper">
            
            {/* 4. HERO SECTION (SLIDER + BANNERS) */}
            <section className="hero-section">
                <div className="container hero-grid">
                    {/* Main Slider (Giả lập) */}
                    <div className="main-slider">
                        <img src="https://placehold.co/800x400/1054e8/ffffff?text=Banner+Khuyen+Mai+Lon" alt="Main Banner" />
                        <div className="slider-nav">
                            <span className="active" /><span /><span />
                        </div>
                    </div>
                    {/* Right Banners */}
                    <div className="right-banners">
                        <img src="https://placehold.co/380x190/orange/white?text=Giam+Gia+Soc" alt="Sub Banner 1" />
                        <img src="https://placehold.co/380x190/green/white?text=Free+Ship+2H" alt="Sub Banner 2" />
                    </div>
                </div>
            </section>

            {/* 5. QUICK ICONS (Tiện ích) */}
            <section className="quick-icons">
                <div className="container icon-grid">
                    <a href="#" className="icon-item">
                        <div className="icon-box ib-1"><i className="fa-solid fa-file-prescription" /></div>
                        <span>Đơn thuốc của bạn</span>
                    </a>
                    <a href="#" className="icon-item">
                        <div className="icon-box ib-2"><i className="fa-solid fa-user-doctor" /></div>
                        <span>Tư vấn dược sĩ</span>
                    </a>
                    <a href="#" className="icon-item">
                        <div className="icon-box ib-3"><i className="fa-solid fa-location-dot" /></div>
                        <span>Tìm nhà thuốc</span>
                    </a>
                    <a href="#" className="icon-item">
                        <div className="icon-box ib-4"><i className="fa-solid fa-gifts" /></div>
                        <span>Tích điểm đổi quà</span>
                    </a>
                    <a href="#" className="icon-item">
                        <div className="icon-box ib-5"><i className="fa-solid fa-heart-circle-check" /></div>
                        <span>Kiểm tra sức khỏe</span>
                    </a>
                </div>
            </section>

            {/* 6. FLASH SALE */}
            <section className="section flash-sale-section">
                <div className="container">
                    <div className="section-header sale-header">
                        <div className="sale-title">
                            <i className="fa-solid fa-bolt" /> FLASH SALE
                            <div className="countdown">
                                <span>02</span>:<span>15</span>:<span>40</span>
                            </div>
                        </div>
                        <a href="#" className="view-all">Xem tất cả &gt;</a>
                    </div>
                    <div className="product-row">
                        {/* Product 1 */}
                       
                         {renderData(flashSaleProducts, false)}
                    </div>
                </div>
            </section>

            {/* 7. THỰC PHẨM CHỨC NĂNG */}
            <section className="section gray-bg">
                <div className="container">
                    <div className="section-header">
                        <h2>Thực phẩm chức năng</h2>
                        <div className="tabs">
                            <a href="#" className="tab active">Sinh lý - Nội tiết tố</a>
                            <a href="#" className="tab">Sức khỏe tim mạch</a>
                            <a href="#" className="tab">Hỗ trợ tiêu hóa</a>
                            <a href="#" className="tab">Thần kinh não bộ</a>
                        </div>
                    </div>

                    <div className="product-grid">
                        {/* SP 1 */}
                        {renderData(tpcnProducts, true)}

                    </div>
                    <div className="view-more-container">
                        <a href="#" className="btn-outline">Xem tất cả thực phẩm chức năng</a>
                    </div>
                </div>
            </section>

            {/* 8. THƯƠNG HIỆU NỔI BẬT */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2>Thương hiệu nổi bật</h2>
                    </div>
                    <div className="brands-grid">
                        <div className="brand-item"><img src="https://placehold.co/150x80/fff/333?text=La+Roche-Posay" alt="Brand" /></div>
                        <div className="brand-item"><img src="https://placehold.co/150x80/fff/333?text=Vichy" alt="Brand" /></div>
                        <div className="brand-item"><img src="https://placehold.co/150x80/fff/333?text=Blackmores" alt="Brand" /></div>
                        <div className="brand-item"><img src="https://placehold.co/150x80/fff/333?text=Durex" alt="Brand" /></div>
                        <div className="brand-item"><img src="https://placehold.co/150x80/fff/333?text=Omron" alt="Brand" /></div>
                        <div className="brand-item"><img src="https://placehold.co/150x80/fff/333?text=Rohto" alt="Brand" /></div>
                    </div>
                </div>
            </section>

            {/* 9. BÀI VIẾT SỨC KHỎE */}
            <Blog/>

        </div>
    );
}

export default Home;