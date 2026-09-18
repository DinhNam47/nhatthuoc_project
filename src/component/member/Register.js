import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
function Register(){
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const[input, setInput] = useState({
        fullName:"",
        email:"",
        password:"",
        confirmPassword:""
    });
    const[error, setErrors] = useState({})
    const hanldeInput =(e) =>{
        const {name, value} = e.target;
        setInput(state => ({...state,[name]:value}))
    }
    function xulyloi(){
        let errorsSubmit = {};
        let flag = true;
        // kiểm tra nhập tên
        if(input.fullName ===""){
            errorsSubmit.fullName = "Vui lòng nhập Họ và Tên"
            flag = false;
        }
        if(input.email ===""){
            errorsSubmit.email = "vui lòng nhập email"
            flag = false
        }
        if(input.password === ""){
            errorsSubmit.password = "Vui lòng nhập password"
            flag = false;
        }
        if (input.confirmPassword === "") {
            errorsSubmit.confirmPassword = "Vui lòng nhập lại mật khẩu";
            flag = false;
        } else if (input.confirmPassword !== input.password) {
            errorsSubmit.confirmPassword = "Mật khẩu nhập lại không khớp";
            flag = false;
        }
        setErrors(errorsSubmit)
        return flag;
    }
    function hanldeSubmit(e){
        e.preventDefault();
        if(xulyloi()){
            const data = {
                fullName: input.fullName,
                email: input.email,
                password: input.password,
                confirmPassword: input.password
            }
            axios.post('http://localhost:3000/api/register',data)
                .then((res)=>{
                    if(res.data.errors){
                        console.log(res.data.errors);
                        setErrors(res.data.errors);
                        toast.error("Vui lòng kiểm tra lại thông tin!");
                    }else{
                        toast.success("🌿 Đăng ký thành công! Chào mừng bạn.");
                        console.log("thông tin use: ", res.data)
                        setTimeout(()=>{
                            navigate('/login');
                        }, 1500)
                    }
                })
                .catch((err) =>{
                    if(err.response){
                        console.log("lỗi từ server: ", err.response.data)
                        toast.error("Đăng ký thất bại: " + (err.response.data.message || "Lỗi hệ thống"));
                    }else{
                        toast.error("Không thể kết nối với server. Vui lòng kiểm tra internet!");
                    }
                })
        }
    }


    return(
    <div className="register-page-body"> 
        <div className="register-wrapper">
            <Link to ="/" className="back-home"><i className="fa-solid fa-arrow-left" /> Về Trang Chủ</Link>
            <div className="register-container">
            <div className="register-left">
                <div className="register-header">
                <h2>Tạo tài khoản mới</h2>
                <p>Đăng ký để nhận ngay ưu đãi 50K cho đơn đầu tiên!</p>
                </div>
                <form encType="multipart/form-data" onSubmit={hanldeSubmit}>
                <div className="form-group">
                    <label>Họ và tên</label>
                    <div className="input-icon-wrap">
                    <i className="fa-regular fa-user" />
                    <input type="text" name="fullName" placeholder="Ví dụ: Nguyễn Văn A" onChange={hanldeInput} />
                    </div>
                    {error.fullName && <p className="error-text" style={{color: 'red', fontSize: '12px'}}>{error.fullName}</p>}
                </div>
                <div className="form-group">
                    <label>Email hoặc Số điện thoại</label>
                    <div className="input-icon-wrap">
                    <i className="fa-regular fa-envelope" />
                    <input type="text" name="email" placeholder="Nhập email" onChange={hanldeInput} />
                    </div>
                    {error.email && <p className="error-text" style={{color: 'red', fontSize: '12px'}}>{error.email}</p>}
                </div>
                <div className="form-group">
                    <label>Mật khẩu</label>
                    <div className="input-icon-wrap">
                    <i className="fa-solid fa-lock" />
                    <input 
                        type={showPassword ? "text" : "password"} // Thay đổi type dựa trên state
                        name="password" 
                        placeholder="Tạo mật khẩu" 
                        className="pass-input" 
                        onChange={hanldeInput}
                    />
                    {/* Icon mắt: bấm vào để toggle state */}
                    <i 
                        className={showPassword ? "fa-regular fa-eye toggle-pass" : "fa-regular fa-eye-slash toggle-pass"} 
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: 'pointer' }}
                    />
                    </div>
                    {error.password && <p className="error-text" style={{color: 'red', fontSize: '12px'}}>{error.password}</p>}
                </div>
                <div className="form-group">
                    <label>Nhập lại mật khẩu</label>
                    <div className="input-icon-wrap">
                    <i className="fa-solid fa-shield-halved" />
                    <input 
                        type={showConfirmPassword ? "text" : "password"} // Thay đổi type dựa trên state
                        name="confirmPassword" 
                        placeholder="Nhập lại mật khẩu" 
                        className="pass-input" 
                        onChange={hanldeInput} 
                    />
                    <i 
                        className={showConfirmPassword ? "fa-regular fa-eye toggle-pass" : "fa-regular fa-eye-slash toggle-pass"} 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ cursor: 'pointer' }}
                    />
                    </div>
                    {error.confirmPassword && <p className="error-text" style={{color: 'red', fontSize: '12px'}}>{error.confirmPassword}</p>}
                </div>
                <div className="terms-group">
                    <label className="terms-check">
                    <input type="checkbox" required />
                    <span>Tôi đồng ý với <a href="#">Điều khoản sử dụng</a> và <a href="#">Chính sách bảo mật</a></span>
                    </label>
                </div>
                <button type="submit" className="btn-submit">Đăng Ký Ngay</button>
                </form>
                <div className="divider">Hoặc đăng ký với</div>
                <div className="social-login">
                <button className="social-btn google">
                    <i className="fa-brands fa-google" /> Google
                </button>
                <button className="social-btn facebook">
                    <i className="fa-brands fa-facebook-f" /> Facebook
                </button>
                </div>
                <p className="login-text">
                Bạn đã có tài khoản? <Link to="/login" > Đăng nhập </Link>
                </p>
            </div>
            <div className="register-right">
                <div className="logo-large">
                <i className="fa-solid fa-leaf" />
                <div>Medi<span>Green</span></div>
                </div>
                <p className="brand-slogan">Sống khỏe mỗi ngày cùng<br />Hệ thống nhà thuốc chuẩn GPP</p>
                <img src="/img/" alt="Banner" className="banner-img" />
            </div>
            </div>
        </div>
      </div>
    )
}
export default Register;