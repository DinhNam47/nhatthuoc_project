
const {PrismaClient} = require('../generated/client');
const prisma = new PrismaClient();
// lưu đăng kí
const register = async(data)=>{
    return prisma.user.create({
        data: {
            email: data.email,
            password: data.password,
            fullName: data.fullName,
            role: data.role || 'User'

        }
    })
}
// hàm login email
const login = async(email)=>{
    return prisma.user.findUnique({where: {email: email}})
}
// lấy tất cả thông tin người dùng
const getAllUsers = async() =>{
    return prisma.user.findMany();
}
// lấy thông tin 1 người
const getUserById = async(id) =>{
    return prisma.user.findUnique({where: {id}})
}
// sửa thông tin người dùng
const updateUser = async(id, data) =>{
    return prisma.user.update({where: {id},data})
    
}
// xóa user
const deleteUser = async(id) =>{
    return prisma.user.delete({where: {id}})
}

module.exports ={
    register,
    login,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    
}