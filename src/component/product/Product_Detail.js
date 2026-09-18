import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Product_Detail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [previewImg, setPreviewImg] = useState('');
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/get-product-by-slug/${slug}`);
                if (res.data.errCode === 0) {
                    setProduct(res.data.data);
                    setPreviewImg(res.data.data.image);
                }
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [slug]);

    // --- HÀM THÊM GIỎ HÀNG (DẠNG OBJECT {"id": qty}) ---
    const handleAddToCart = (isBuyNow = false) => {
        // 1. Lấy giỏ hàng cũ (Dạng Object {})
        let currentCart = JSON.parse(localStorage.getItem('cart')) || {};

        // 2. Lấy ID sản phẩm (Chuyển về string để làm key an toàn)
        const productId = product.id.toString();

        // 3. Logic: Có rồi thì cộng dồn, chưa có thì gán mới
        if (currentCart[productId]) {
            currentCart[productId] = Number(currentCart[productId]) + quantity;
        } else {
            currentCart[productId] = quantity;
        }

        // 4. Lưu lại vào LocalStorage (Kết quả: {"1": 2, "5": 10})
        localStorage.setItem('cart', JSON.stringify(currentCart));
        
        // Cập nhật Header (nếu có)
        window.dispatchEvent(new Event("storage"));

        // 5. Điều hướng
        if (isBuyNow) {
            navigate('/cart');
        } else {
            alert("Đã thêm vào giỏ hàng thành công!");
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const getImgUrl = (imgName) => imgName ? `http://localhost:3000/images/${imgName}` : "https://placehold.co/400x400?text=No+Image";

    if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Đang tải dữ liệu...</div>;
    if (!product) return <div style={{padding:'50px', textAlign:'center'}}>Không tìm thấy sản phẩm!</div>;

    let galleryImages = [];
    try {
        galleryImages = product.gallery ? JSON.parse(product.gallery) : [];
    } catch(e) {}

    const currentPrice = product.price;
    const oldPrice = product.original_price || (product.discount > 0 ? (currentPrice * 100) / (100 - product.discount) : 0);

    return (
        <div className="product-detail-page">
            <div className="container">
                <div className="breadcrumb">
                    <Link to="/">Trang chủ</Link> / 
                    <Link to="#">Thực phẩm chức năng</Link> / 
                    <span>{product.name}</span>
                </div>

                <div className="product-main-section">
                    {/* CỘT TRÁI: ẢNH */}
                    <div className="product-gallery">
                        <div className="main-image-box">
                            <img src={getImgUrl(previewImg)} alt={product.name} />
                        </div>
                        <div className="thumb-list">
                            <div className={`thumb-item ${previewImg === product.image ? 'active' : ''}`}
                                 onClick={() => setPreviewImg(product.image)}>
                                <img src={getImgUrl(product.image)} alt="Main" />
                            </div>
                            {galleryImages.map((img, idx) => (
                                <div key={idx} 
                                     className={`thumb-item ${previewImg === img ? 'active' : ''}`}
                                     onClick={() => setPreviewImg(img)}>
                                    <img src={getImgUrl(img)} alt={`Thumb ${idx}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CỘT PHẢI: THÔNG TIN */}
                    <div className="product-info-col">
                        <div className="p-brand-row">
                            <img src="https://flagcdn.com/w20/vn.png" alt="Flag" style={{marginRight:'5px'}}/>
                            <span className="p-origin">{product.origin || 'Việt Nam'}</span>
                            <span className="p-divider">|</span>
                            <span className="p-brand">Thương hiệu: <b>{product.manufacturer || 'Đang cập nhật'}</b></span>
                        </div>

                        <h1 className="p-title-lg">{product.name}</h1>
                        
                        <div className="p-price-area">
                            <span className="p-current-price">{formatCurrency(currentPrice)}</span>
                            <span className="p-unit-text">/ {product.unit}</span>
                            {product.discount > 0 && (
                                <div className="p-old-price-row">
                                    <span className="p-old-price">{formatCurrency(oldPrice)}</span>
                                    <span className="p-discount-badge">-{product.discount}%</span>
                                </div>
                            )}
                        </div>

                        <div className="p-option-row">
                            <span className="opt-label">Chọn số lượng</span>
                            <div className="qty-control-lg">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                                <input type="number" value={quantity} readOnly />
                                <button onClick={() => setQuantity(q => q + 1)}>+</button>
                            </div>
                        </div>

                        {/* --- SỬA LỖI Ở ĐÂY --- */}
                        <div className="p-action-buttons">
                            {/* Nút Mua ngay: Chạy hàm với tham số true */}
                            <button 
                                className="btn-buy-lg" 
                                onClick={() => handleAddToCart(true)}
                            >
                                Chọn mua
                            </button>
                            
                            {/* Nút Thêm giỏ: Chạy hàm với tham số false */}
                            <button 
                                className="btn-add-cart-lg" 
                                onClick={() => handleAddToCart(false)}
                            >
                                Thêm vào giỏ hàng
                            </button>
                        </div>
                        {/* --------------------- */}

                        {product.discount > 0 && (
                            <div className="p-promotion-box">
                                <div className="promo-header"><i className="fa-solid fa-gift"></i> Khuyến mãi áp dụng</div>
                                <div className="promo-item">
                                    <span className="tag">%</span> Giảm ngay {product.discount}% khi mua online
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="product-tabs-section">
                    <div className="tabs-header">
                        <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>Mô tả sản phẩm</button>
                        <button className={activeTab === 'ingredients' ? 'active' : ''} onClick={() => setActiveTab('ingredients')}>Thành phần</button>
                        <button className={activeTab === 'usage' ? 'active' : ''} onClick={() => setActiveTab('usage')}>Công dụng & Liều dùng</button>
                    </div>
                    
                    <div className="tab-content">
                        {activeTab === 'description' && (
                            <div dangerouslySetInnerHTML={{__html: product.description || 'Đang cập nhật...'}} />
                        )}
                        {activeTab === 'ingredients' && (
                            <div className="simple-text-content">{product.ingredients || 'Đang cập nhật...'}</div>
                        )}
                        {activeTab === 'usage' && (
                            <div className="simple-text-content">
                                <p><b>Công dụng:</b> {product.usage_dosage || 'Đang cập nhật'}</p>
                                <p><b>Chống chỉ định:</b> {product.contraindications || 'Không có'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Product_Detail;