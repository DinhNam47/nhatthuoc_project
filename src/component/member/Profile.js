import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import './Profile.css';

function Profile() {
    const [user, setUser] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [infoErrors, setInfoErrors] = useState({});
    const [pwdErrors, setPwdErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
    const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('token');
        const authData = JSON.parse(localStorage.getItem('auth') || '{}');

        if (!token || !authData.id) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await axios.get(`http://localhost:3000/api/users/${authData.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data?.data || res.data;
            if (data) {
                setUser({
                    fullName: data.fullName || '',
                    email: data.email || '',
                    phone: data.phone || data.phoneNumber || '',
                    address: data.address || ''
                });
            }
        } catch (err) {
            console.error('Lỗi lấy thông tin cá nhân:', err);
            toast.error('Không thể tải thông tin tài khoản');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
        if (infoErrors[name]) {
            setInfoErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
        if (pwdErrors[name]) {
            setPwdErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Validate cập nhật thông tin cá nhân
    const validateInfoForm = () => {
        const errs = {};
        let isValid = true;

        if (!user.fullName.trim()) {
            errs.fullName = 'Vui lòng nhập họ và tên!';
            isValid = false;
        }

        if (user.phone && !/^[0-9]{10,11}$/.test(user.phone.trim())) {
            errs.phone = 'Số điện thoại không hợp lệ (cần 10-11 chữ số)!';
            isValid = false;
        }

        setInfoErrors(errs);
        return isValid;
    };

    // Validate đổi mật khẩu
    const validatePasswordForm = () => {
        const errs = {};
        let isValid = true;

        if (!passwordData.currentPassword.trim()) {
            errs.currentPassword = 'Vui lòng nhập mật khẩu hiện tại!';
            isValid = false;
        }

        if (!passwordData.newPassword.trim()) {
            errs.newPassword = 'Vui lòng nhập mật khẩu mới!';
            isValid = false;
        } else if (passwordData.newPassword.length < 6) {
            errs.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự!';
            isValid = false;
        } else if (passwordData.newPassword === passwordData.currentPassword) {
            errs.newPassword = 'Mật khẩu mới không được trùng với mật khẩu cũ!';
            isValid = false;
        }

        if (!passwordData.confirmPassword.trim()) {
            errs.confirmPassword = 'Vui lòng nhập lại mật khẩu mới!';
            isValid = false;
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errs.confirmPassword = 'Mật khẩu xác nhận không khớp!';
            isValid = false;
        }

        setPwdErrors(errs);
        return isValid;
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!validateInfoForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin cá nhân!');
            return;
        }

        setIsUpdatingInfo(true);
        const token = localStorage.getItem('token');
        const authData = JSON.parse(localStorage.getItem('auth') || '{}');

        try {
            await axios.put(
                `http://localhost:3000/api/users/${authData.id}`,
                {
                    fullName: user.fullName,
                    phone: user.phone,
                    address: user.address
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const updatedAuth = { ...authData, fullName: user.fullName };
            localStorage.setItem('auth', JSON.stringify(updatedAuth));

            toast.success('Cập nhật hồ sơ thành công!');
        } catch (err) {
            console.error('Lỗi cập nhật hồ sơ:', err);
            toast.error(err.response?.data?.message || 'Cập nhật thất bại!');
        } finally {
            setIsUpdatingInfo(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!validatePasswordForm()) {
            toast.error('Vui lòng kiểm tra lại các trường mật khẩu!');
            return;
        }

        setIsUpdatingPwd(true);
        const token = localStorage.getItem('token');
        const authData = JSON.parse(localStorage.getItem('auth') || '{}');

        try {
            await axios.put(
                `http://localhost:3000/api/users/change-password/${authData.id}`,
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success('Đổi mật khẩu thành công!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPwdErrors({});
        } catch (err) {
            console.error('Lỗi đổi mật khẩu:', err);
            toast.error(err.response?.data?.message || 'Mật khẩu hiện tại không chính xác!');
        } finally {
            setIsUpdatingPwd(false);
        }
    };

    if (isLoading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    <div className="profile-spinner"></div>
                    <p>Đang tải thông tin tài khoản...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h2>Tài khoản của tôi</h2>
                    <p>Quản lý thông tin hồ sơ và bảo mật tài khoản cá nhân</p>
                </div>

                <div className="profile-grid">
                    {/* KHU VỰC 1: THÔNG TIN CÁ NHÂN */}
                    <div className="profile-card">
                        <h3 className="card-title">
                            <i className="fa-regular fa-id-badge me-2"></i> Thông tin cá nhân
                        </h3>
                        <form onSubmit={handleUpdateProfile} noValidate>
                            <div className="form-group">
                                <label>Địa chỉ Email</label>
                                <input
                                    type="email"
                                    className="profile-input disabled"
                                    value={user.email}
                                    disabled
                                />
                                <small className="hint-text">Email dùng để định danh tài khoản và không thể thay đổi</small>
                            </div>

                            <div className="form-group">
                                <label>
                                    Họ và tên <span className="red">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    className={`profile-input ${infoErrors.fullName ? 'input-error' : ''}`}
                                    value={user.fullName}
                                    onChange={handleInfoChange}
                                    placeholder="Nhập đầy đủ họ và tên"
                                />
                                {infoErrors.fullName && <small className="error-text">{infoErrors.fullName}</small>}
                            </div>

                            <div className="form-group">
                                <label>Số điện thoại nhận hàng</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className={`profile-input ${infoErrors.phone ? 'input-error' : ''}`}
                                    value={user.phone}
                                    onChange={handleInfoChange}
                                    placeholder="VD: 0347316739"
                                />
                                {infoErrors.phone && <small className="error-text">{infoErrors.phone}</small>}
                            </div>

                            <div className="form-group">
                                <label>Địa chỉ nhận hàng mặc định</label>
                                <textarea
                                    name="address"
                                    className="profile-input"
                                    rows="3"
                                    value={user.address}
                                    onChange={handleInfoChange}
                                    placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                                ></textarea>
                            </div>

                            <button type="submit" className="btn-save" disabled={isUpdatingInfo}>
                                {isUpdatingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </form>
                    </div>

                    {/* KHU VỰC 2: ĐỔI MẬT KHẨU */}
                    <div className="profile-card">
                        <h3 className="card-title">
                            <i className="fa-solid fa-lock me-2"></i> Đổi mật khẩu
                        </h3>
                        <form onSubmit={handleChangePassword} noValidate>
                            <div className="form-group">
                                <label>
                                    Mật khẩu hiện tại <span className="red">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    className={`profile-input ${pwdErrors.currentPassword ? 'input-error' : ''}`}
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Nhập mật khẩu đang sử dụng"
                                />
                                {pwdErrors.currentPassword && (
                                    <small className="error-text">{pwdErrors.currentPassword}</small>
                                )}
                            </div>

                            <div className="form-group">
                                <label>
                                    Mật khẩu mới <span className="red">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    className={`profile-input ${pwdErrors.newPassword ? 'input-error' : ''}`}
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Tối thiểu 6 ký tự"
                                />
                                {pwdErrors.newPassword && <small className="error-text">{pwdErrors.newPassword}</small>}
                            </div>

                            <div className="form-group">
                                <label>
                                    Xác nhận mật khẩu mới <span className="red">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className={`profile-input ${pwdErrors.confirmPassword ? 'input-error' : ''}`}
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                                {pwdErrors.confirmPassword && (
                                    <small className="error-text">{pwdErrors.confirmPassword}</small>
                                )}
                            </div>

                            <button type="submit" className="btn-save btn-change-pwd" disabled={isUpdatingPwd}>
                                {isUpdatingPwd ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;