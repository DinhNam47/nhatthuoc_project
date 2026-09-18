const authModel = require("../models/authModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
// đăng kí người dùng
const register = async (req, res) => {
  const { email, password, fullName, role } = req.body;
  // console.log(req.body)
  // kiểm tra email đã tôn tại chưa
  const existingUser = await authModel.login(email);
  if (existingUser) {
    return res.status(400).json({ message: "Email đã được sử dụng!" });
  }
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const user = await authModel.register({
    email,
    password: hashedPassword,
    fullName,
    role,
  });
  console.log(">>> Đăng kí Thành Công", user);
  res.json(user);
};
// hàm login
const login = async (req, res) => {
  const { email, password } = req.body;
  // tìm người dùng trong data bằng email
  const user = await authModel.login(email);
  if (!user) {
    return res.status(400).json({ message: "Tài Khoản không tồn tại!" });
  }
  // so sánh mật khẩu vs mật khẫu đã băng
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Mật khẩu không chính xác!" });
  }

  // QUAN TRỌNG TẠO TOKEN  token chưa id và role của người dùng
  const token = jwt.sign(
    { id: user.id, role: user.role },
    "bi_mat_nha_thuoc_2026", // mã hóa bí mật
    { expiresIn: "1d" }, // token có hiệu lực trong 1 ngày
  );
  // nếu đúng thì trả về thông báo, GỬI TOKEN CHO CLIENT
  res.json({
    message: "Đăng nhập thành công!",
    token: token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
  console.log(">>>Đăng Nhập OK", user);
};

// lấy tất cả người dùng
const getAllUsers = async (req, res) => {
  const user = await authModel.getAllUsers();
  res.json(user);
};
// lấy thông tin 1 người dùng
const getUserById = async (req, res) => {
  const id = parseInt(req.params.id);
  const user = await authModel.getUserById(id);
  console.log(">>> thông tin: ", user);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "Không có User" });
  }
};
// sửa thông tin người dùng
const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const { email, password, fullName, role } = req.body;
  console.log(req.body);
  const user = await authModel.updateUser(id, {
    email,
    password,
    fullName,
    role,
  });
  console.log(">>> thông tin chỉnh sửa", user);
  res.json(user);
};
// xóa người dùng
const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  await authModel.deleteUser(id);
  res.json({ message: "Đã xóa User" });
};

// tạo cấu hình gửi mail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nam84588@gmail.com",
    pass: "yihc fjag jvzb xzya",
  },
});
// 1. API gửi link quên mật khẩu
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // SỬA: Dùng authModel thay vì userModel. Có thể tái sử dụng hàm login để tìm email.
    const user = await authModel.findByEmail(email);

    if (!user) {
      return res
        .status(404)
        .json({ message: "Email không tồn tại trong hệ thống" });
    }

    // Tạo 1 token đặc biệt chỉ dùng để reset password, hết hạn sau 5 phút
    const resetToken = jwt.sign({ id: user.id }, "bi_mat_nha_thuoc_2026", {
      expiresIn: "5m",
    });

    // Tạo link trỏ về Frontend React
    const resetLink = `http://localhost:3001/reset-password?token=${resetToken}`;

    // Nội dung email
    const mailOptions = {
      from: "Nam Support <nam84588@gmail.com>",
      to: email,
      subject: "Yêu cầu đặt lại mật khẩu - Nhà Thuốc City",
      html: `
        <div style="background-color: #eeeff1; padding: 30px 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <div style="max-width: 460px; margin: 0 auto; background-color: #0d1527; border-radius: 10px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                
                <!-- Phần Header -->
                <div style="padding: 24px 28px 16px; border-bottom: 1px solid #162238;">
                    <div style="color: #ffffff; font-size: 25px; font-weight: 700; margin-bottom: 6px;">
                         Yêu cầu đặt lại mật khẩu - Nhà Thuốc City
                    </div>
                    <div style="color: #94a3b8; font-size: 13px;">
                        Từ: <span style="color: #38bdf8;">security@securevault.io</span>
                        <span style="background-color: #2e1065; color: #c084fc; font-size: 11px; padding: 2px 6px; border-radius: 4px; margin-left: 6px; font-weight: 600;">Đã ký số</span>
                    </div>
                </div>

                <!-- Phần Nội dung chính -->
                <div style="padding: 24px 28px;">
                    <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">
                        Xin chào <strong style="color: #ffffff;">${user.fullName || 'nguyenvana'}</strong>,
                    </p>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0; line-height: 1.5;">
                        Nhấn vào nút bên dưới để tiến hành đổi mật khẩu mới cho tài khoản của bạn:
                    </p>

                    <!-- Nút bấm Reset -->
                    <div style="text-align: center; margin-bottom: 24px;">
                        <a href="${resetLink}" target="_blank" style="display: block; background-color: #c7d2fe; color: #1e1b4b; text-decoration: none; padding: 13px 20px; border-radius: 8px; font-size: 15px; font-weight: 700; transition: background-color 0.2s;">
                            &#8635; Đặt lại mật khẩu mới
                        </a>
                    </div>

                    <!-- Footer nhỏ trong card -->
                    <table style="width: 100%; border-top: 1px solid #162238; padding-top: 16px;">
                        <tr>
                            <td style="color: #38bdf8; font-size: 12px; text-align: left;">
                                &#9201; Hiệu lực: 5 phút
                            </td>
                           
                        </tr>
                    </table>
                </div>

            </div>
        </div>
    `,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: "Vui lòng kiểm tra email để đặt lại mật khẩu" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 2. API Cập nhật mật khẩu mới
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    // SỬA: Đưa về chung Secret Key với hàm forgotPassword
    const decoded = jwt.verify(token, "bi_mat_nha_thuoc_2026");
    const userId = decoded.id;

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // SỬA: Dùng authModel thay cho userModel
    await authModel.updateUser(userId, { password: hashedPassword });

    return res
      .status(200)
      .json({ message: "Đổi mật khẩu thành công! Bạn có thể đăng nhập lại." });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ message: "Link đặt lại mật khẩu đã hết hạn." });
    }
    return res
      .status(500)
      .json({ message: "Token không hợp lệ hoặc lỗi server" });
  }
};
// ĐỔI PASSWORD TRỰC TIẾP
// Đổi mật khẩu trực tiếp khi đã đăng nhập
const changePassword = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới!" });
    }

    // 1. Tìm user theo ID
    const user = await authModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }

    // 2. Kiểm tra mật khẩu cũ có đúng không
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không chính xác!" });
    }

    // 3. Mã hóa mật khẩu mới và cập nhật vào DB
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await authModel.updateUser(id, { password: hashedPassword });

    return res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    console.error("Lỗi changePassword:", error);
    return res.status(500).json({ message: "Lỗi server khi đổi mật khẩu!" });
  }
};
module.exports = {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  changePassword
};
