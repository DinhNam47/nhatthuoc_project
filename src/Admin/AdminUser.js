import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

function AdminUser() {
    const [data, setData] = useState([]);
    // Lấy thông tin admin đang đăng nhập để tránh tự xóa chính mình
    const auth = JSON.parse(localStorage.getItem("auth")); 

    // 1. Hàm lấy danh sách người dùng (Cần gửi kèm Token)
    const fetchUsers = () => {
        const token = localStorage.getItem("token"); 
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        axios.get('http://localhost:3000/api/users', config)
            .then((res) => {
                // API trả về mảng trực tiếp theo ảnh Postman của bạn
                setData(res.data);
            })
            .catch((err) => {
                console.error("Lỗi API:", err);
                if (err.response?.status === 403) {
                    toast.error("Bạn không có quyền Admin hoặc phiên làm việc hết hạn");
                }
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 2. Hàm chỉnh sửa quyền Admin/User
    const handleUpdateRole = (id, newRole, name) => {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Không cho phép tự hạ quyền của chính mình
        if (name === auth?.fullName && newRole === 'User') {
            toast.error("Bạn không thể tự hạ quyền Admin của chính mình!");
            return;
        }

        axios.put(`http://localhost:3000/api/users/${id}`, { role: newRole }, config)
            .then(() => {
                toast.success(`Đã đổi quyền ${name} thành ${newRole}`);
                fetchUsers(); // Tải lại danh sách để cập nhật giao diện
            })
            .catch(() => toast.error("Lỗi khi cập nhật quyền"));
    };

    // 3. Hàm xóa tài khoản
    const handleDelete = (id, name) => {
        if (window.confirm(`Bạn có chắc muốn xóa tài khoản của ${name}?`)) {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            axios.delete(`http://localhost:3000/api/users/${id}`, config)
                .then(() => {
                    toast.success("Xóa thành công!");
                    setData(data.filter(item => item.id !== id));
                })
                .catch(() => toast.error("Không thể xóa người dùng này"));
        }
    };

    // 4. Hàm render dữ liệu theo phong cách thầy dạy
    function renderData() {
        if (data && data.length > 0) {
            return data.map((value, index) => {
                return (
                    <tr key={value.id} style={{ borderBottom: '1px solid #4a5568' }}>
                        <td style={{ padding: '15px' }}>{value.id}</td>
                        <td style={{ fontWeight: '600' }}>{value.fullName}</td>
                        <td>{value.email}</td>
                        <td>
                            {/* MENU CHỌN QUYỀN TRỰC TIẾP */}
                            <select 
                                value={value.role}
                                onChange={(e) => handleUpdateRole(value.id, e.target.value, value.fullName)}
                                style={{
                                    background: '#1a202c',
                                    color: value.role === 'Admin' ? '#ef4444' : '#10b981',
                                    border: '1px solid #4a5568',
                                    borderRadius: '6px',
                                    padding: '5px 10px',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                                <option value="Staff">Staff</option>
                            </select>
                        </td>
                        <td>
                            {/* Không hiện nút xóa nếu là chính mình */}
                            {value.fullName !== auth?.fullName && (
                                <button 
                                    onClick={() => handleDelete(value.id, value.fullName)}
                                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                                >
                                    <i className="fa-solid fa-trash-can"></i>
                                </button>
                            )}
                        </td>
                    </tr>
                );
            });
        }
        return (
            <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    Đang tải danh sách người dùng...
                </td>
            </tr>
        );
    }

    // 5. Giao diện chính đồng bộ Dark Theme
    return (
        <div className="admin-user-page">
            <div className="admin-card-header" style={{ marginBottom: '25px' }}>
                <h2 style={{ color: '#10b981', margin: 0 }}>Quản lý tài khoản</h2>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Chỉnh sửa quyền hạn và quản lý nhân sự hệ thống.</p>
            </div>

            <div className="admin-table-wrapper" style={{ 
                background: '#2d3748', 
                padding: '20px', 
                borderRadius: '15px',
                boxShadow: '0 10px 15px rgba(0,0,0,0.2)' 
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #4a5568', color: '#10b981' }}>
                            <th style={{ padding: '15px' }}>ID</th>
                            <th>Họ Tên</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderData()}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminUser;