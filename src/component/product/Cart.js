import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import axios from 'axios';
// import './Cart.css';

function Cart() {
    const navigate = useNavigate(); // 2. Khởi tạo navigate
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // --- 1. LOAD DỮ LIỆU ---
    useEffect(() => {
        fetchCartData();
    }, []);

    // --- 2. TÍNH TỔNG TIỀN ---
    useEffect(() => {
        const total = cartItems.reduce((acc, item) => {
            return acc + (item.price * item.qty);
        }, 0);
        setTotalAmount(total);
    }, [cartItems]);

    // --- 3. HÀM LẤY DATA TỪ API & LOCALSTORAGE ---
    const fetchCartData = async () => {
        const localCart = JSON.parse(localStorage.getItem('cart')) || {};
        const listIds = Object.keys(localCart);

        if (listIds.length === 0) {
            setCartItems([]);
            setIsLoading(false);
            return;
        }

        try {
            const res = await axios.post('http://localhost:3000/api/product/cart', { 
                id: listIds.map(id => parseInt(id)) 
            });

            if (res.data.errCode === 0) {
                const apiProducts = res.data.data;

                const mergedCart = apiProducts.map(product => {
                    return {
                        ...product,
                        qty: localCart[product.id] || 1
                    };
                });

                setCartItems(mergedCart);
            }
        } catch (error) {
            console.error("Lỗi tải giỏ hàng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- 4. HÀM LƯU NGƯỢC LẠI LOCALSTORAGE ---
    const updateLocalStorage = (currentItems) => {
        const storageObj = {};
        currentItems.forEach(item => {
            storageObj[item.id] = item.qty;
        });

        localStorage.setItem('cart', JSON.stringify(storageObj));
        window.dispatchEvent(new Event("storage"));
    };

    // --- 5. TĂNG / GIẢM ---
    const handleQuantity = (id, delta) => {
        const newItems = cartItems.map(item => {
            if (item.id === id) {
                const newQty = item.qty + delta;
                
                if (newQty < 1) return item;
                if (item.quantity && newQty > item.quantity) {
                    alert(`Trong kho chỉ còn ${item.quantity} sản phẩm!`);
                    return item;
                }
                return { ...item, qty: newQty };
            }
            return item;
        });

        setCartItems(newItems);
        updateLocalStorage(newItems);
    };

    // --- 6. XÓA ---
    const handleRemove = (id) => {
        if (window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
            const newItems = cartItems.filter(item => item.id !== id);
            setCartItems(newItems);
            updateLocalStorage(newItems);
        }
    };

    // --- 7. CHUYỂN HƯỚNG THANH TOÁN (MỚI) ---
    const handleProceedCheckout = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Vui lòng đăng nhập trước khi tiến hành thanh toán!");
            navigate('/login');
            return;
        }

        // Chuyển sang /checkout kèm dữ liệu giỏ hàng
        navigate('/checkout', {
            state: {
                items: cartItems,
                totalAmount: totalAmount
            }
        });
    };

    // Helper
    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    const getImgUrl = (img) => img ? `http://localhost:3000/images/${img}` : "https://placehold.co/100?text=No+Img";

    if (isLoading) return <div className="cart-loading" style={{padding:'50px', textAlign:'center'}}>Đang tải giỏ hàng...</div>;

    if (cartItems.length === 0) {
        return (
            <div className="cart-empty" style={{padding:'50px', textAlign:'center'}}>
                <i className="fa-solid fa-cart-arrow-down" style={{fontSize: '50px', color: '#ccc'}}></i>
                <p>Giỏ hàng của bạn đang trống</p>
                <Link to="/" className="btn-continue" style={{color: 'blue'}}>Tiếp tục mua sắm</Link>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h2 className="cart-header">Giỏ hàng ({cartItems.length} sản phẩm)</h2>

                <div className="cart-container">
                    <div className="cart-list">
                        <table className="cart-table">
                            <thead>
                                <tr>
                                    <th className="th-product">Thông tin sản phẩm</th>
                                    <th className="th-price">Đơn giá</th>
                                    <th className="th-qty">Số lượng</th>
                                    <th className="th-total">Thành tiền</th>
                                    <th className="th-action"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="ci-info">
                                                <img src={getImgUrl(item.image)} alt={item.name} />
                                                <div>
                                                    <Link to={`/san-pham/${item.slug}`} className="ci-name">{item.name}</Link>
                                                    <span className="ci-unit">Đơn vị: {item.unit}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="ci-price">{formatPrice(item.price)}</td>
                                        <td>
                                            <div className="qty-box">
                                                <button onClick={() => handleQuantity(item.id, -1)}>-</button>
                                                <input type="text" value={item.qty} readOnly />
                                                <button onClick={() => handleQuantity(item.id, 1)}>+</button>
                                            </div>
                                        </td>
                                        <td className="ci-total">{formatPrice(item.price * item.qty)}</td>
                                        <td>
                                            <button className="btn-trash" onClick={() => handleRemove(item.id)}>
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="cart-summary">
                        <div className="summary-card">
                            <div className="sum-row">
                                <span>Tạm tính:</span>
                                <span>{formatPrice(totalAmount)}</span>
                            </div>
                            <div className="sum-row">
                                <span>Giảm giá:</span>
                                <span>0 đ</span>
                            </div>
                            <hr />
                            <div className="sum-row total">
                                <span>Tổng cộng:</span>
                                <span className="text-red">{formatPrice(totalAmount)}</span>
                            </div>
                            <div className="vat-note">(Đã bao gồm VAT nếu có)</div>

                            {/* Gắn hàm handleProceedCheckout */}
                            <button className="btn-checkout" onClick={handleProceedCheckout}>
                                MUA HÀNG NGAY
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;