const authModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
// đăng kí người dùng
const register = async(req, res) => {
    const {email, password, fullName,role} = req.body;
    // console.log(req.body)
    // kiểm tra email đã tôn tại chưa
    const existingUser = await authModel.login(email)
    if(existingUser){
        return res.status(400).json({message: 'Email đã được sử dụng!'})
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await authModel.register({email, password: hashedPassword, fullName, role})
    console.log(">>> Đăng kí Thành Công", user)
    res.json(user)
}
// hàm login
const login = async(req, res) =>{
    const {email, password} = req.body;
    // tìm người dùng trong data bằng email
    const user = await authModel.login(email);
    if(!user){
        return res.status(400).json({message: "Tài Khoản không tồn tại!"});
    }
    // so sánh mật khẩu vs mật khẫu đã băng
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(400).json({message:"Mật khẩu không chính xác!"});
    }

    // QUAN TRỌNG TẠO TOKEN  token chưa id và role của người dùng
    const token = jwt.sign(
        {id: user.id, role: user.role},
        'bi_mat_nha_thuoc_2026', // mã hóa bí mật
        {expiresIn: '1d'} // token có hiệu lực trong 1 ngày
    )
    // nếu đúng thì trả về thông báo, GỬI TOKEN CHO CLIENT
    res.json({message: "Đăng nhập thành công!",
            token: token,
            user:{id: user.id, email: user.email, fullName: user.fullName, role: user.role}})
            console.log(">>>Đăng Nhập OK", user)

}

// lấy tất cả người dùng
const getAllUsers = async(req, res) => {
    const user = await authModel.getAllUsers();
    res.json(user)
}
// lấy thông tin 1 người dùng
const getUserById = async(req, res) => {
    const id = parseInt(req.params.id);
    const user = await authModel.getUserById(id);
    console.log(">>> thông tin: ", user)
    if(user){
        res.json(user)
    }else{
        res.status(404).json({error: 'Không có User'})
    }
}
// sửa thông tin người dùng
const updateUser = async(req, res) =>{
    const id = parseInt(req.params.id);
    const {email, password, fullName, role} = req.body
    console.log(req.body)
    const user = await authModel.updateUser(id, {email, password, fullName, role})
    console.log(">>> thông tin chỉnh sửa", user)
    res.json(user)
}
// xóa người dùng
const deleteUser = async(req,res) =>{
    const id = parseInt(req.params.id);
    await authModel.deleteUser(id);
    res.json({message: "Đã xóa User"})
}

module.exports = {
    register,
    login,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
}