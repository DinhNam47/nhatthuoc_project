import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import './ResetPassword.css';

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // States để ẩn/hiện mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // States xử lý API
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [logoutAll, setLogoutAll] = useState(true);

    // Điều kiện validate mật khẩu
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Tính toán mức độ mạnh của mật khẩu (để hiển thị thanh màu)
    const getStrengthLevel = () => {
        let score = 0;
        if (hasMinLength) score++;
        if (hasNumber) score++;
        if (hasUpperAndLower) score++;
        if (hasSpecialChar) score++;
        return score;
    };

    const strengthScore = getStrengthLevel();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!token) {
            setError("Không tìm thấy mã xác thực (token). Vui lòng kiểm tra lại đường link trong email.");
            return;
        }

        if (strengthScore < 4) {
            setError("Vui lòng đáp ứng đủ các điều kiện bảo mật của mật khẩu.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setIsLoading(true);

        axios.post("http://localhost:3000/api/users/reset-pass", { 
            token: token, 
            newPassword: password 
            // Nếu sau này backend có tính năng đăng xuất thiết bị khác, bạn truyền thêm logoutAll: true/false
        })
        .then((res) => {
            setSuccess(res.data.message || "Cập nhật mật khẩu thành công!");
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        })
        .catch((err) => {
            setError(err.response?.data?.message || "Liên kết hết hạn hoặc có lỗi xảy ra.");
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    return (
        <div className="reset-pw-layout">
            <div className="reset-pw-card">
                <div className="card-top-gradient-green"></div>

                <div className="card-body">
                    {/* Header Icon */}
                    <div className="header-icon-wrapper">
                        <div className="header-icon-inner">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'white'}}>
                                <path d="M12 3v18M3 12h18M16.24 7.76l-8.48 8.48M7.76 7.76l8.48 8.48" />
                            </svg>
                        </div>
                        <div className="lock-badge-icon">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0110 0v4"></path>
                            </svg>
                        </div>
                    </div>

                    <div className="security-badge">
                        <span className="badge-dot"></span> XÁC THỰC AN TOÀN
                    </div>

                    <h2 className="title">Thiết lập mật khẩu mới</h2>
                    <p className="subtitle">
                        Tạo mật khẩu mới an toàn và khó đoán cho tài khoản<br/>
                        <strong style={{color: '#10b981'}}>tài khoản của bạn</strong>
                    </p>

                    <form onSubmit={handleSubmit}>
                        {/* Input Mật khẩu mới */}
                        <div className="form-group">
                            <div className="label-wrapper">
                                <label>Mật khẩu mới</label>
                                <span className="status-text">{password.length > 0 ? 'Đang nhập...' : 'Chưa nhập'}</span>
                            </div>
                            <div className="input-with-icon">
                                <span className="input-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0110 0v4"></path>
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <span className="toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"></path></svg>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Hộp kiểm tra độ mạnh mật khẩu */}
                        <div className="password-strength-box">
                            <div className="strength-header">
                                <span>ĐỘ MẠNH MẬT KHẨU</span>
                                <span>{strengthScore === 4 ? 'MẠNH' : strengthScore >= 2 ? 'TRUNG BÌNH' : 'CHƯA XÁC ĐỊNH'}</span>
                            </div>
                            <div className="strength-bars">
                                <div className={`bar ${strengthScore >= 1 ? 'active' : ''}`}></div>
                                <div className={`bar ${strengthScore >= 3 ? 'active' : ''}`}></div>
                                <div className={`bar ${strengthScore >= 4 ? 'active' : ''}`}></div>
                            </div>
                            <div className="strength-criteria">
                                <ul>
                                    <li className={hasMinLength ? 'met' : ''}>
                                        <span className="circle"></span> Tối thiểu 8 ký tự
                                    </li>
                                    <li className={hasNumber ? 'met' : ''}>
                                        <span className="circle"></span> Ít nhất 1 chữ số
                                    </li>
                                </ul>
                                <ul>
                                    <li className={hasUpperAndLower ? 'met' : ''}>
                                        <span className="circle"></span> Hoa & thường
                                    </li>
                                    <li className={hasSpecialChar ? 'met' : ''}>
                                        <span className="circle"></span> Ký tự đặc biệt (@, #...)
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Input Xác nhận mật khẩu */}
                        <div className="form-group">
                            <div className="label-wrapper">
                                <label>Xác nhận mật khẩu mới</label>
                            </div>
                            <div className="input-with-icon">
                                <span className="input-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 2v6h-6"></path>
                                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                                        <path d="M3 22v-6h6"></path>
                                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                                    </svg>
                                </span>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <span className="toggle-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"></path></svg>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Checkbox Đăng xuất thiết bị khác */}
                        <div className="logout-box" onClick={() => setLogoutAll(!logoutAll)}>
                            <div className={`checkbox-custom ${logoutAll ? 'checked' : ''}`}>
                                {logoutAll && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                            <div className="logout-text">
                                <strong>Đăng xuất khỏi tất cả thiết bị khác <span className="tag-recommended">KHUYẾN NGHỊ</span></strong>
                                <p>Hủy các phiên đăng nhập đang hoạt động để bảo vệ an toàn tối đa.</p>
                            </div>
                        </div>

                        {/* Báo lỗi / Thành công */}
                        {error && <div className="alert-message error">{error}</div>}
                        {success && <div className="alert-message success">{success}</div>}

                        {/* Submit Button */}
                        <button type="submit" className="btn-submit-green" disabled={isLoading}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            {isLoading ? "ĐANG CẬP NHẬT..." : "CẬP NHẬT MẬT KHẨU MỚI"}
                        </button>
                    </form>

                    <div className="back-to-login">
                        <Link to="/login">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Quay lại trang đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;