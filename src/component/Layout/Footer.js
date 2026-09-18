function Footer(){
    return(
        <footer className="main-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-col">
              <h4>Về MediPharma</h4>
              <ul>
                <li><a href="#">Giới thiệu</a></li>
                <li><a href="#">Hệ thống cửa hàng</a></li>
                <li><a href="#">Giấy phép kinh doanh</a></li>
                <li><a href="#">Chính sách bảo mật</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Danh mục</h4>
              <ul>
                <li><a href="#">Thuốc</a></li>
                <li><a href="#">Thực phẩm chức năng</a></li>
                <li><a href="#">Dược mỹ phẩm</a></li>
                <li><a href="#">Thiết bị y tế</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Hỗ trợ khách hàng</h4>
              <ul>
                <li><a href="#">Điều khoản sử dụng</a></li>
                <li><a href="#">Chính sách đổi trả</a></li>
                <li><a href="#">Giao hàng &amp; Thanh toán</a></li>
                <li><a href="#">Mua hàng trả góp</a></li>
              </ul>
            </div>
            <div className="footer-col contact-col">
              <h4>Liên hệ</h4>
              <p><strong>Hotline:</strong> 1800 6928 (Miễn phí)</p>
              <p><strong>Email:</strong> cskh@medipharma.com</p>
              <div className="app-download">
                <p>Tải ứng dụng ngay:</p>
                <div className="store-btns">
                  <img src="https://placehold.co/120x40/000/fff?text=App+Store" alt="App Store" />
                  <img src="https://placehold.co/120x40/000/fff?text=Google+Play" alt="Google Play" />
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Công ty Cổ phần Dược phẩm MediPharma. All rights reserved.</p>
            <div className="payment-icons">
              <i className="fa-brands fa-cc-visa" />
              <i className="fa-brands fa-cc-mastercard" />
              <i className="fa-solid fa-money-bill-wave" />
            </div>
          </div>
        </div>
      </footer>
    )
}
export default Footer;