import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Toaster } from "sonner";
import Login from "./component/member/Login";
import Register from "./component/member/Register";
import Home from "./component/HomePage/Home";
import AdminLayout from "./Admin/AdminLayout";
import AdminUser from "./Admin/AdminUser";
import AdminProduct from "./Admin/AdminProduct";
import AdminCategory from "./Admin/AdminCategory";
import Product_Detail from "./component/product/Product_Detail";
import Cart from "./component/product/Cart";
import ForgotPassword from "./component/member/ForgotPassword";
import ResetPassword from "./component/member/ResetPassword";
import Checkout from "./component/product/Checkout";
import MyOrders from "./component/product/MyOrders";
import AdminOrders from "./Admin/AdminOrders";
import Profile from "./component/member/Profile";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<App><Home /></App>}/>
        <Route path="/login" element={<App><Login /></App>}/>
        <Route path="/register" element={<App><Register /></App>}/>
        <Route path="/product/detail/:slug" element={<App><Product_Detail /></App>}/>
        <Route path="/forgot-password" element={<App><ForgotPassword /></App>}/>
        <Route path="/reset-password"element={<App><ResetPassword /></App>}/>
        <Route path="/cart" element={<App><Cart /></App>}/>
        <Route path="/checkout"element={<App><Checkout /></App>}/>
        <Route path="/my-orders" element={<App><MyOrders /></App>}/>
        <Route path='/profile' element={<App><Profile /></App>} />
        {/* Nhóm Route cho Admin (chỉ dùng cho admin) */}
        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <AdminUser />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminLayout>
              <AdminProduct />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/category"
          element={
            <AdminLayout>
              <AdminCategory />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminLayout>
              <AdminOrders />
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
