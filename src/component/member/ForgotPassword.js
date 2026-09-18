import axios from "axios";
import { useState } from "react";
// Đảm bảo bạn đã import file CSS này
import './ForgotPassword.css'; 

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (email === "") {
            setError("Vui lòng nhập địa chỉ email.");
            return;
        }

        setIsLoading(true);
        // Giữ nguyên logic gọi API của bạn
        axios.post("http://localhost:3000/api/users/forget-pass", { email })
            .then((res) => {
                setSuccess(res.data.message || "Đã gửi liên kết khôi phục thành công!");
                setEmail("");
            })
            .catch((err) => {
                setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="forget-pw-layout">
            <div className="forget-pw-card">
                {/* Thanh viền gradient trên cùng */}
                <div className="card-top-gradient"></div>

                <div className="card-body">
                    {/* Icon Header */}
                    <div className="header-icon-wrapper">
                        <div className="header-icon-inner">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'white'}}>
                                <path d="M12 3v18M3 12h18M16.24 7.76l-8.48 8.48M7.76 7.76l8.48 8.48" />
                            </svg>
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="security-badge">
                        <span className="badge-dot"></span> BẢO MẬT TÀI KHOẢN
                    </div>

                    <h2 className="title text-center">Quên mật khẩu?</h2>
                    <p className="subtitle text-center">
                        Đừng lo lắng! Hãy nhập địa chỉ email đã đăng ký của bạn, chúng tôi sẽ gửi liên kết khôi phục mật khẩu ngay lập tức.
                    </p>

                    <form onSubmit={handleSubmit}>
                        {/* Nhóm Input Email */}
                        <div className="form-group">
                            <div className="label-wrapper">
                                <label>Địa chỉ Email</label>
                                <span className="required-text">Bắt buộc</span>
                            </div>
                            <div className="input-with-icon">
                                <span className="input-icon"> </span>
                                <input
                                    type="email"
                                    placeholder="vidu@congty.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="input-hint">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                Liên kết đặt lại có hiệu lực trong 5 phút.
                            </div>
                        </div>

                        {/* Hộp thông tin quy trình */}
                        <div className="info-box process-box">
                            <div className="info-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                            </div>
                            <div className="info-text">
                                <strong>Quy trình khôi phục:</strong>
                                <p>Một mã xác minh dùng một lần (OTP) và liên kết an toàn sẽ được phát hành tới hộp thư đến của bạn để mở khóa bảng điều khiển.</p>
                            </div>
                        </div>

                        {/* Thông báo Lỗi / Thành công */}
                        {error && <div className="alert-message error">{error}</div>}
                        {success && <div className="alert-message success">{success}</div>}

                        {/* Nút Submit */}
                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? "ĐANG XỬ LÝ..." : "GỬI LIÊN KẾT KHÔI PHỤC"}
                            {!isLoading && (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '8px'}}>
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            )}
                        </button>
                    </form>

                    {/* Các hộp thông tin bảo mật */}
                    <div className="security-info-boxes">
                        <div className="info-box security-box">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0110 0v4"></path>
                            </svg>
                            <span>Khóa mật mã đầu-cuối (End-to-End Encryption) bảo vệ định danh tài khoản.</span>
                        </div>
                        <div className="info-box security-box">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                            <span>Cảnh báo lừa đảo: SecureVault không bao giờ yêu cầu bạn cung cấp mã xác minh cá nhân.</span>
                        </div>
                    </div>

                    {/* Link quay lại */}
                    <div className="back-to-login">
                        <a href="/login">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Quay lại đăng nhập
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;