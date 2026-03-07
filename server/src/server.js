const express = require('express');
const http = require('http');
const app = express();
const port = 3000;

const connectDB = require('./config/connectDB');
const routes = require('./routes/index.routes');
const SocketHandler = require('./socket/socketHandler');

const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

// Kết nối database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({ origin: process.env.URL_CLIENT, credentials: true }));

app.use(express.static(path.join(__dirname, '../src')));

// Routes
routes(app);

// Error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi server',
    });
});

// Tạo HTTP server
const server = http.createServer(app);

// Khởi tạo Socket.io
const socketHandler = new SocketHandler(server);

// Export để có thể sử dụng ở nơi khác nếu cần
global.socketHandler = socketHandler;

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Socket.io ready for connections`);
});
