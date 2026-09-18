import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {useNavigate} from "react-router-dom"
import axios from "axios";
import { toast } from "sonner";
function Login(){
    const[showPassword, setShowPassword] = useState(false);
    // 3. Hàm xử lý đảo ngược trạng thái
    const togglePassword = () => {
        setShowPassword(!showPassword);
    };
    const [input, setInput] = useState({
        email:"",
        password:"",
        rememberMe: false // thêm state ghi nhớ 
    })
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    // nếu đã login thì về luôn trang chủ
    useEffect(()=>{
        const token = localStorage.getItem("token");
        if(token){
            navigate("/")
            // Lấy email đã ghi nhớ (nếu có)
        const savedEmail = localStorage.getItem("rememberedEmail");
        if (savedEmail) {
            setInput(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
        }
        }
    },[navigate])
    const handleInput =(e)=>{
        const{name,value, type, checked} = e.target;
        // xử lí riêng cho check box ghi nhớ mật khẩu
        const inputValue = type === "checkbox" ? checked : value;
        setInput(state => ({...state,[name]: inputValue}))
    }
    function xulyloi(){
        let errorsSubmit ={};
        let flag = true;
        if(input.email === ""){
            errorsSubmit.email = "Vui lòng nhập email."
            flag = false;
        }
        if(input.password === ""){
            errorsSubmit.password = "Vui lòng nhập password"
            flag = false;
        }
        setErrors(errorsSubmit)
        return flag;
    }
    function hanldeSubmit(e){
        e.preventDefault();
        if(xulyloi()){
            let data ={
                email: input.email,
                password: input.password
            }
            axios.post('http://localhost:3000/api/login', data)
                .then((res) => {
                    if (res.data.errors) {
                        console.log("kết quả APi:", res.data.errors)
                        setErrors(res.data.errors)
                        toast.error("🌿 Email hoặc mật khẩu không đúng");
                    } else {
                        console.log("thông tin", res.data)
                        // 1. Lưu token
                        localStorage.setItem('token', res.data.token)
                        // 2. Lưu thông tin user (để lấy role sau này)
                        const userData = res.data.user || res.data.Auth || res.data.data;
                        if (userData) {
                            localStorage.setItem("auth", JSON.stringify(userData));
                        } else {
                            console.log("⚠️ API không có dữ liệu user:", res.data);
                        }
                        // 3. Xử lý ghi nhớ email
                        if (input.rememberMe) {
                            localStorage.setItem("rememberedEmail", input.email);
                        } else {
                            localStorage.removeItem("rememberedEmail");
                        }
                        toast.success("🌿 Đăng nhập thành công")
                        // --- PHẦN QUAN TRỌNG: CHUYỂN HƯỚNG THEO ROLE ---
                        setTimeout(()=>{
                            if (userData && userData.role === "Admin") {
                            // Nếu là Admin thì vào thẳng trang quản lý tài khoản
                                window.location.href = "/admin/users";
                            } else {
                                // Nếu là User bình thường thì về trang chủ mua thuốc
                                window.location.href = "/";
                            }
                        },1500)
                    }
                })
                .catch((err)=>{
                    if(err.response){
                        console.log("lỗi từ server: ", err.response.data)
                        toast.error("Đăng nhập thất bại: " + (err.response.data.message || "Lỗi hệ thống"));
                    }else{
                        toast.error("Không thể kết nối với server. Vui lòng kiểm tra internet!");
                    }
                })
        }
    }
    return(
        <div className="login-page-body">
            <div className="login-wrapper">
                <Link to ="/" className="back-home"><i className="fa-solid fa-arrow-left" /> Về Trang Chủ</Link>
                <div className="login-container">
                <div className="login-left">
                    <div className="login-header">
                    <h2>Chào mừng trở lại!</h2>
                    <p>Vui lòng đăng nhập để tiếp tục mua sắm</p>
                    </div>
                    <form onSubmit={hanldeSubmit}>
                    <div className="form-group">
                        <label>Email </label>
                        <div className="input-icon-wrap">
                        {/* <i className="fa-regular fa-envelope" /> */}
                        <input type="text" name="email" placeholder="Nhập email" onChange={handleInput} />
                        </div>
                        {errors.email && <span className="error-msg" style={{color: 'red', fontSize: '12px'}}>{errors.email}</span>}
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <div className="input-icon-wrap">
                            {/* <i className="fa-solid fa-lock" /> Icon bên trái */}
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Nhập mật khẩu"
                                name="password" 
                                onChange={handleInput}
                            />
                            <i 
                                className={showPassword ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"} 
                                id="toggle-pass"
                                onClick={togglePassword}
                            /> {/* Icon bên phải */}
                        </div>
                        {errors.password && <span className="error-msg" style={{color: 'red', fontSize: '12px'}}>{errors.password}</span>}
                        
                    </div>
                    <div className="form-options">
                        <label className="remember-check">
                        <input type="checkbox" name="rememberMe" checked={input.rememberMe} onChange={handleInput} /> <span>Ghi nhớ đăng nhập</span>
                        </label>
                        {/* <a href="#" className="forgot-link">Quên mật khẩu?</a> */}
                        <Link to={'/forgot-password'} className="forgot-link">Quên mật khẩu?</Link>
                    </div>
                    <button type="submit" className="btn-submit">Đăng Nhập</button>
                    </form>
                    <div className="divider">Hoặc đăng nhập với</div>
                    <div className="social-login">
                    <button type="button" className="social-btn google">
                        <i className="fa-brands fa-google" /> Google
                    </button>
                    <button type="button" className="social-btn facebook">
                        <i className="fa-brands fa-facebook-f" /> Facebook
                    </button>
                    </div>
                    <p className="register-text">
                    Bạn chưa có tài khoản? <Link to="/register" ><i className="fa-solid fa-circle-user" /> Đăng ký ngay </Link>
                    </p>
                </div>
                <div className="login-right">
                    <div className="logo-large">
                    <i className="fa-solid fa-leaf" />
                    <div>Medi<span>Green</span></div>
                    </div>
                    <p className="brand-slogan">Hệ thống nhà thuốc chuẩn GPP<br />Chăm sóc sức khỏe gia đình bạn.</p>
                    <img src="/img/ảnh logo thuoc.png" alt="Banner" className="banner-img" />
                </div>
                </div>
            </div>
        </div>
    )
}
export default Login;