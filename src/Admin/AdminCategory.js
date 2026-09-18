import { toast } from "sonner";
import axios from "axios";
import { useState, useEffect } from "react";
function AdminCategory (){
    // 1. Khai báo State
    const [categories, setCategories] = useState([]);
    const [input, setInput] = useState({
        name: "",
        slug: "",
        description: "",
        status: true // Mặc định là hiện (true)
    });
    const [editId, setEditId] = useState(null); // Quản lý ID khi đang sửa

    // 2. Lấy danh sách danh mục từ Backend
    const fetchCategories = async () => {
        try {
            const res = await axios.get("http://localhost:3000/api/categories");
            if (res.data && res.data.errCode === 0) {
                // console.log("Dữ liệu nhận được:", res.data.data);
                setCategories(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi fetch:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // 3. Hàm tạo Slug tự động (Giúp nhập liệu nhanh hơn)
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

    // 4. Xử lý nhập liệu
    const handleInput = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "name") {
            setInput({ ...input, name: value, slug: toSlug(value) });
        } else {
            setInput({ ...input, [name]: type === "checkbox" ? checked : value });
        }
    };

    // 5. Gửi dữ liệu (Thêm mới hoặc Cập nhật)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.name) return toast.error("Vui lòng nhập tên danh mục!");

        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            let res;
            if (editId) {
                // Chế độ Cập nhật
                res = await axios.put(`http://localhost:3000/api/categories/${editId}`, input, config);
            } else {
                // Chế độ Thêm mới
                res = await axios.post("http://localhost:3000/api/categories-create", input, config);
            }

            if (res.data.errCode === 0) {
                toast.success(res.data.message);
                handleCancel(); // Reset form
                fetchCategories(); // Tải lại bảng
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Lỗi hệ thống, vui lòng thử lại!");
        }
    };

    // 6. Xử lý Sửa
    const handleEdit = (category) => {
        setEditId(category.id);
        setInput({
            name: category.name,
            slug: category.slug,
            description: category.description || "",
            status: category.status
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // 7. Xử lý Xóa
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            try {
                const token = localStorage.getItem("token"); // Lấy token
                const config = { 
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    } 
                };

                const res = await axios.delete(`http://localhost:3000/api/categories/${id}`, config);
                if (res.data.errCode === 0) {
                    toast.success("Xóa thành công!");
                    fetchCategories();
                } else {
                    toast.error(res.data.message); // Hiện lỗi nếu còn thuốc bên trong
                }
            } catch (error) {
                toast.error("Không thể xóa danh mục này!");
            }
        }
    };

    // 8. Hủy bỏ chế độ sửa
    const handleCancel = () => {
        setEditId(null);
        setInput({ name: "", slug: "", description: "", status: true });
    };

    return (
        <div className="admin-container">
            <h2 className="page-title">Quản lý danh mục</h2>
            
            {/* FORM NHẬP LIỆU */}
            <div className="admin-card">
                <h4 className="section-title">
                    <i className="fa-solid fa-list-check"></i> {editId ? "Cập nhật danh mục" : "Thêm danh mục mới"}
                </h4>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Tên danh mục <span className="red">*</span></label>
                            <input type="text" className="dark-input" name="name" 
                                value={input.name} onChange={handleInput} />
                        </div>
                        <div className="form-group half-width">
                            <label>Slug (URL)</label>
                            <input type="text" className="dark-input disabled" name="slug" 
                                value={input.slug} readOnly />
                        </div>
                    </div>

                    <div className="form-group mt-3">
                        <label>Mô tả ngắn</label>
                        <textarea className="dark-input" name="description" rows="2"
                            value={input.description} onChange={handleInput}></textarea>
                    </div>

                   <div className="form-group mt-3">
                        <label className="section-title" style={{ fontSize: '14px', color: '#a0aec0' }}>
                            Thiết lập hiển thị
                        </label>
                        <div className="mt-2">
                            <label className="toggle-status-wrapper">
                                <input 
                                    type="checkbox" 
                                    className="toggle-input" 
                                    name="status" 
                                    id="status-toggle"
                                    checked={input.status} // Logic true/false khớp với dữ liệu bạn nhận được
                                    onChange={handleInput} 
                                />
                                <div className="toggle-slider"></div>
                                <span className="status-label-text" style={{ color: input.status ? '#00d25b' : '#fc424a' }}>
                                    {input.status ? "Cho phép hiển thị danh mục" : "Tạm ẩn danh mục này"}
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-4 flex-gap">
                        <button type="submit" className="btn-submit" style={{backgroundColor: editId ? '#f59e0b' : '#00d25b'}}>
                            <i className="fa-solid fa-save me-2"></i> {editId ? "Cập nhật" : "Lưu danh mục"}
                        </button>
                        {editId && (
                            <button type="button" className="btn-submit" style={{backgroundColor: '#4a5568'}} onClick={handleCancel}>
                                Hủy bỏ
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* BẢNG DANH SÁCH */}
            <h3 className="section-header-lg mt-5">Danh sách hiện có</h3>
            <div className="admin-card no-padding">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên danh mục</th>
                            <th>Số lượng thuốc</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id}>
                                <td>{cat.id}</td>
                                <td className="text-bold-green">{cat.name}</td>
                                <td>{cat._count?.products || 0} sản phẩm</td>
                                <td>
                                    {cat.status ? (
                                        <span style={{ 
                                            backgroundColor: '#00d25b', 
                                            color: 'white', 
                                            padding: '5px 10px', 
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            Đang hiện
                                        </span>
                                    ) : (
                                        <span style={{ 
                                            backgroundColor: '#fc424a', 
                                            color: 'white', 
                                            padding: '5px 10px', 
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            Đang ẩn
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <button className="btn-icon edit me-2" onClick={() => handleEdit(cat)}>
                                        <i className="fa-solid fa-pencil"></i>
                                    </button>
                                    <button className="btn-icon delete" onClick={() => handleDelete(cat.id)}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default AdminCategory;