import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";

function AdminProduct() {
    // 1. Khởi tạo State (Đã thêm đầy đủ các trường mới)
    const [input, setInput] = useState({
        // --- CƠ BẢN ---
        name: "",
        slug: "",
        price: "",
        original_price: "",
        discount: 0,
        quantity: "",
        unit: "Hộp",
        categoryId: null,
        
        // --- ẢNH ---
        avatar: [],
        previewOldImages: [],

        // --- MỚI: NGUỒN GỐC ---
        manufacturer: "",       // Nhà sản xuất
        origin: "",             // Xuất xứ
        packaging: "",          // Quy cách
        registration_num: "",   // Số đăng ký

        // --- MỚI: THÔNG TIN Y TẾ ---
        short_description: "",  // Mô tả ngắn
        usage_dosage: "",       // Liều dùng
        contraindications: "",  // Chống chỉ định
        side_effects: "",       // Tác dụng phụ
        ingredients: "",        // Thành phần
        description: "",        // Mô tả chi tiết (HTML)
    });

    const [editId, setEditId] = useState(null);
    const [errors, setErrors] = useState({});
    const [products, setProducts] = useState([]);
    const fileInputRef = useRef(null);
    const [categories, setCategories] = useState([]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get("http://localhost:3000/api/categories");
            if (res && res.data && res.data.errCode === 0) {
                setCategories(res.data.data);
            }
        } catch (error) {
            console.log("Lỗi fetch categories:", error);
        }
    };

    useEffect(() => {
        fetchAllProducts();
        fetchCategories();
    }, []);

    const removeNewImage = (index) => {
        setInput(prev => ({
            ...prev,
            avatar: prev.avatar.filter((_, i) => i !== index)
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const fetchAllProducts = async () => {
        try {
            let res = await axios.get('http://localhost:3000/api/products');
            if (res && res.data && res.data.errCode === 0) {
                setProducts(res.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    function handleInput(e) {
        const { name, value } = e.target;
        if (name === "name") {
            setInput(state => ({
                ...state,
                name: value,
                slug: toSlug(value)
            }));
        } else {
            setInput(state => ({ ...state, [name]: value }));
        }
    }

    function handleFile(e) {
        const files = Array.from(e.target.files || []);
        setInput(state => ({ ...state, avatar: files }));
        setErrors(state => ({ ...state, avatar: "" }));
    }

    // --- CẬP NHẬT HÀM EDIT ĐỂ LẤY DỮ LIỆU MỚI ---
    const handleEditProduct = (product) => {
        setEditId(product.id);

        let oldImages = [];
        try {
            if (product.gallery) {
                oldImages = JSON.parse(product.gallery);
            } else if (product.image) {
                oldImages = [product.image];
            }
        } catch (e) { oldImages = [product.image]; }

        setInput({
            name: product.name,
            slug: product.slug,
            price: product.price,
            original_price: product.original_price || "",
            discount: product.discount || 0,
            quantity: product.quantity,
            unit: product.unit,
            categoryId: product.categoryId || null,
            
            // Map các trường mới
            manufacturer: product.manufacturer || "",
            origin: product.origin || "",
            packaging: product.packaging || "",
            registration_num: product.registration_num || "",
            
            short_description: product.short_description || "",
            usage_dosage: product.usage_dosage || "",
            contraindications: product.contraindications || "",
            side_effects: product.side_effects || "",
            
            ingredients: product.ingredients || "",
            description: product.description || "",
            
            avatar: [],
            previewOldImages: oldImages
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- CẬP NHẬT HÀM HỦY ĐỂ RESET DỮ LIỆU ---
    const handleCancelEdit = () => {
        setEditId(null);
        setInput({
            name: "", slug: "", price: "", original_price: "", discount: 0,
            quantity: "", unit: "Hộp", categoryId: null,
            
            manufacturer: "", origin: "", packaging: "", registration_num: "",
            short_description: "", usage_dosage: "", contraindications: "", side_effects: "",
            
            ingredients: "", description: "", avatar: [], previewOldImages: []
        });
    }

    const toSlug = (str) => {
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/\s+/g, "-");
        str = str.replace(/[^a-z0-9-]/g, "");
        str = str.replace(/-+/g, "-");
        return str;
    };

    function xulyloi() {
        let errorsSubmit = {};
        let flag = true;

        if (input.name === "") { errorsSubmit.name = "Vui lòng nhập tên thuốc"; flag = false; }
        if (input.slug === "") { errorsSubmit.slug = "Vui lòng nhập Slug"; flag = false; }
        if (input.price === "") { errorsSubmit.price = "Vui lòng nhập giá bán"; flag = false; }
        if (input.quantity === "") { errorsSubmit.quantity = "Nhập số lượng kho"; flag = false; }
        // Mô tả ngắn cũng nên bắt buộc để hiển thị card đẹp hơn
        if (input.short_description === "") { errorsSubmit.short_description = "Nhập mô tả ngắn"; flag = false; }

        const files = input.avatar || [];
        if (!editId && files.length === 0) {
            errorsSubmit.avatar = "Vui lòng upload ít nhất 1 ảnh";
            flag = false;
        } else if (files.length > 5) {
            errorsSubmit.avatar = "Tối đa 5 hình ảnh thôi";
            flag = false;
        }

        setErrors(errorsSubmit);
        return flag;
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!xulyloi()) { toast.error("Kiểm tra lại thông tin!"); return; }

        const formData = new FormData();
        // Append các trường cơ bản
        formData.append("name", input.name);
        formData.append("slug", input.slug);
        formData.append("price", input.price);
        formData.append("original_price", input.original_price);
        formData.append("discount", input.discount || 0);
        formData.append("quantity", input.quantity);
        formData.append("unit", input.unit);
        formData.append("categoryId", input.categoryId ? parseInt(input.categoryId) : "");
        
        // --- APPEND CÁC TRƯỜNG MỚI ---
        formData.append("manufacturer", input.manufacturer);
        formData.append("origin", input.origin);
        formData.append("packaging", input.packaging);
        formData.append("registration_num", input.registration_num);
        
        formData.append("short_description", input.short_description);
        formData.append("usage_dosage", input.usage_dosage);
        formData.append("contraindications", input.contraindications);
        formData.append("side_effects", input.side_effects);
        
        formData.append("ingredients", input.ingredients);
        formData.append("description", input.description);

        input.avatar.forEach(file => { formData.append("images", file); });

        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const apiCall = editId 
            ? axios.put(`http://localhost:3000/api/products/${editId}`, formData, config)
            : axios.post("http://localhost:3000/api/products-create", formData, config);

        apiCall
            .then(res => {
                if (res.data.errCode === 0) {
                    toast.success(editId ? "Cập nhật thành công!" : "Thêm thành công!");
                    handleCancelEdit();
                    fetchAllProducts();
                } else {
                    toast.error(res.data.message);
                }
            })
            .catch(() => toast.error("Lỗi hệ thống"));
    }

    const handleDeleteProduct = async (id) => {
        if (window.confirm("Xóa thuốc này?")) {
            try {
                let res = await axios.delete(`http://localhost:3000/api/products/${id}`);
                if (res && res.data.errCode === 0) {
                    toast.success("Đã xóa!");
                    fetchAllProducts();
                }
            } catch (e) { console.log(e); }
        }
    }

    function renderData() {
        if (!products || products.length === 0) {
            return (<tr><td colSpan="6" className="text-center py-4">Chưa có dữ liệu...</td></tr>);
        }
        return products.map((item, index) => {
            let imageName = "";
            if (item.gallery) {
                try {
                    const images = JSON.parse(item.gallery);
                    if (Array.isArray(images) && images.length > 0) imageName = images[0];
                } catch (err) {}
            }
            if (!imageName && item.image) imageName = item.image;
            const imgSrc = imageName ? `http://localhost:3000/images/${imageName}` : "";

            return (
                <tr key={index}>
                    <td>{item.id}</td>
                    <td className="cart_product">
                        {imgSrc && <img src={imgSrc} alt={item.name} style={{ width: "80px", height: "60px", objectFit: "cover" }} />}
                        {item.discount > 0 && <span className="badge bg-danger ms-1">-{item.discount}%</span>}
                    </td>
                    <td className="text-bold-green">{item.name}</td>
                    <td>{item.discount}</td>
                    <td>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}</td>
                    <td>{item.quantity} {item.unit}</td>
                    <td>
                        <button className="btn-icon delete" onClick={() => handleDeleteProduct(item.id)}><i className="fa-solid fa-trash"></i></button>
                        <button className="btn-icon edit me-2" onClick={() => handleEditProduct(item)}><i className="fa-solid fa-pencil"></i></button>
                    </td>
                </tr>
            );
        });
    }

    return (
        <div className="admin-container">
            <h2 className="page-title">Quản lý sản phẩm</h2>
            <div className="admin-card">
                {/* --- KHU VỰC 1: THÔNG TIN CƠ BẢN & ẢNH --- */}
                <div className="layout-grid">
                    <div className="left-column">
                        <h4 className="section-title"><i className="fa-solid fa-info-circle"></i> Thông tin cơ bản</h4>
                        <div className="form-row">
                            <div className="form-group half-width">
                                <label>Tên thuốc <span className="red">*</span></label>
                                <input type="text" className="dark-input" name="name" value={input.name} onChange={handleInput} placeholder="Ví dụ: Panadol Extra..." />
                                {errors.name && <small className="red">{errors.name}</small>}
                            </div>
                            <div className="form-group half-width">
                                <label>Slug (URL) <span className="red">*</span></label>
                                <input type="text" className="dark-input disabled" name="slug" value={input.slug} readOnly />
                            </div>
                        </div>

                        <div className="form-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                                <label>Giá bán <span className="red">*</span></label>
                                <input type="number" className="dark-input" name="price" value={input.price} onChange={handleInput} />
                                {errors.price && <small className="red">{errors.price}</small>}
                            </div>
                            <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                                <label>Giá gốc</label>
                                <input type="number" className="dark-input" name="original_price" value={input.original_price} onChange={handleInput} />
                            </div>
                            <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                                <label>Giảm (%)</label>
                                <input type="number" className="dark-input" name="discount" min="0" max="100" value={input.discount} onChange={handleInput} />
                            </div>
                            <div className="form-group" style={{ flex: 1, minWidth: '80px' }}>
                                <label>Kho <span className="red">*</span></label>
                                <input type="number" className="dark-input" name="quantity" value={input.quantity} onChange={handleInput} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group half-width">
                                <label>Đơn vị</label>
                                <select className="dark-input" name="unit" value={input.unit} onChange={handleInput}>
                                    <option value="Hộp">Hộp</option>
                                    <option value="Vỉ">Vỉ</option>
                                    <option value="Viên">Viên</option>
                                    <option value="Chai">Chai</option>
                                    <option value="Lọ">Lọ</option>
                                    <option value="Tuýp">Tuýp</option>
                                    <option value="Gói">Gói</option>
                                    <option value="Ống">Ống</option>
                                </select>
                            </div>
                            <div className="form-group half-width">
                                <label>Danh mục <span className="red">*</span></label>
                                <select className="dark-input" name="categoryId" value={input.categoryId || ""} onChange={handleInput}>
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="right-column">
                        <h4 className="section-title"><i className="fa-solid fa-images"></i> Ảnh sản phẩm</h4>
                        <div className="form-group">
                            <div className="preview-container-grid">
                                {input.avatar && input.avatar.length > 0 ? (
                                    input.avatar.map((file, index) => (
                                        <div key={index} className="mini-preview">
                                            <img src={URL.createObjectURL(file)} alt="new" />
                                            <button className="btn-mini-remove" type="button" onClick={() => removeNewImage(index)}>✕</button>
                                        </div>
                                    ))
                                ) : (
                                    input.previewOldImages && input.previewOldImages.map((imgName, index) => (
                                        <div key={index} className="mini-preview">
                                            <img src={imgName.startsWith('http') ? imgName : `http://localhost:3000/images/${imgName}`} alt="old" />
                                            <span className="old-badge" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', textAlign: 'center' }}>Cũ</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            {errors.avatar && <small className="red d-block mt-2">{errors.avatar}</small>}
                            <div className="upload-group mt-3">
                                <input id="file-upload" type="file" hidden multiple onChange={handleFile} ref={fileInputRef} />
                                <label htmlFor="file-upload" className="btn-upload w-100 justify-center"><i className="fa-solid fa-cloud-arrow-up"></i> Tải ảnh lên</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="divider"></div>

                {/* --- KHU VỰC 2: NGUỒN GỐC & QUY CÁCH (MỚI) --- */}
                <h4 className="section-title"><i className="fa-solid fa-truck-medical"></i> Nguồn gốc & Quy cách</h4>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                        <label>Nhà sản xuất</label>
                        <input type="text" className="dark-input" name="manufacturer" value={input.manufacturer} onChange={handleInput} placeholder="VD: Dược Hậu Giang" />
                    </div>
                    <div className="form-group">
                        <label>Xuất xứ</label>
                        <input type="text" className="dark-input" name="origin" value={input.origin} onChange={handleInput} placeholder="VD: Việt Nam" />
                    </div>
                    <div className="form-group">
                        <label>Quy cách đóng gói</label>
                        <input type="text" className="dark-input" name="packaging" value={input.packaging} onChange={handleInput} placeholder="VD: Hộp 2 vỉ x 10 viên" />
                    </div>
                    <div className="form-group">
                        <label>Số đăng ký</label>
                        <input type="text" className="dark-input" name="registration_num" value={input.registration_num} onChange={handleInput} placeholder="VD: VD-12345-23" />
                    </div>
                </div>

                <div className="divider"></div>

                {/* --- KHU VỰC 3: THÔNG TIN Y TẾ CHI TIẾT (MỚI) --- */}
                <h4 className="section-title"><i className="fa-solid fa-file-prescription"></i> Thông tin y tế</h4>
                
                <div className="form-group">
                    <label>Mô tả ngắn (Hiển thị ở danh sách) <span className="red">*</span></label>
                    <textarea className="dark-input" rows="2" name="short_description" value={input.short_description} onChange={handleInput} placeholder="Mô tả tóm tắt về thuốc..."></textarea>
                    {errors.short_description && <small className="red">{errors.short_description}</small>}
                </div>

                <div className="form-row">
                    <div className="form-group half-width">
                        <label>Liều dùng & Cách dùng</label>
                        <textarea className="dark-input" rows="4" name="usage_dosage" value={input.usage_dosage} onChange={handleInput} placeholder="Người lớn: 1 viên/lần..."></textarea>
                    </div>
                    <div className="form-group half-width">
                        <label>Thành phần / Hoạt chất</label>
                        <textarea className="dark-input" rows="4" name="ingredients" value={input.ingredients} onChange={handleInput} placeholder="Paracetamol 500mg..."></textarea>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group half-width">
                        <label>Chống chỉ định</label>
                        <textarea className="dark-input" rows="3" name="contraindications" value={input.contraindications} onChange={handleInput} placeholder="Không dùng cho người mẫn cảm..."></textarea>
                    </div>
                    <div className="form-group half-width">
                        <label>Tác dụng phụ</label>
                        <textarea className="dark-input" rows="3" name="side_effects" value={input.side_effects} onChange={handleInput} placeholder="Có thể gây buồn ngủ..."></textarea>
                    </div>
                </div>

                <div className="form-group">
                    <label>Mô tả chi tiết (Bài viết sản phẩm)</label>
                    <textarea className="dark-input" rows="6" name="description" value={input.description} onChange={handleInput} placeholder="Nội dung chi tiết hiển thị ở trang chi tiết..."></textarea>
                </div>

                {/* BUTTONS */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '20px' }}>
                    <button className="btn-submit" onClick={handleSubmit} style={{ backgroundColor: editId ? '#f59e0b' : '#00d25b' }}>
                        <i className="fa-solid fa-floppy-disk me-2"></i>{editId ? " Cập nhật thuốc" : " Lưu thuốc mới"}
                    </button>
                    {editId && <button className="btn-submit" onClick={handleCancelEdit} style={{ backgroundColor: '#4a5568' }}>Hủy Bỏ</button>}
                </div>
            </div>

            <h3 className="section-header-lg">Danh sách thuốc</h3>
            <div className="admin-card no-padding">
                <table className="custom-table">
                    <thead><tr><th>ID</th><th>Ảnh</th><th>Tên thuốc</th><th>discount</th><th>Giá</th><th>Kho</th><th>Hành động</th></tr></thead>
                    <tbody>{renderData()}</tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminProduct;