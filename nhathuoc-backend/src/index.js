const express = require('express');
const {PrismaClient} = require("./generated/client");
const path = require('path');
const app = express();
const port = 3000;
const prisma = new PrismaClient();

const cors = require('cors')
app.use(cors()) // bắt buộc để cho phép fontend gọi API
app.use('/images', express.static(path.join(__dirname, 'public/images')));
// xử lý JSON data
app.use(express.json());
// xử lý x-www-form-urlencoded data
app.use(express.urlencoded({extended: true}));
app.use('/api', require('./router/api'))

app.get('/',(req, res) => {
    res.send("Chào Mừng Trương Đình Nam đến với Express ");
});
app.listen(3000, ()=>{
    console.log(`Server is running on port 3000`);
});