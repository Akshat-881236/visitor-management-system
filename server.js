// server.js

require('dotenv').config();
require('./config/db');

const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

// ======================================================
// BASIC MIDDLEWARES
// ======================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());

// ======================================================
// STATIC FILES
// ======================================================

// Public HTML/CSS/JS
app.use(express.static(path.join(__dirname, 'public')));

// Uploaded Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// SVG Files
app.use('/svg', express.static(path.join(__dirname, 'SVG')));

// ======================================================
// ROUTES IMPORT
// ======================================================

const adminAuthRoutes = require('./routes/adminAuthRoutes');
const visitorRoutes = require('./routes/visitorRoutes');

// ======================================================
// API ROUTES
// ======================================================
app.use('/api/admin', adminAuthRoutes);
app.use('/api/visitor', visitorRoutes);
app.use(
    '/api/admin',
    require('./routes/adminVisitorRoutes')
);
app.use(
    '/api/security',
    require('./routes/securityAuthRoutes')
);
app.use(
    '/api/security',
    require('./routes/securityRoutes')
);

// ======================================================
// FRONTEND ROUTES
// ======================================================

// Home Page
app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'index.html')
    );
});

// Visitor Portal
app.get('/visitor', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'Visitor', 'index.html')
    );
});

// Security Login
app.get('/security', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'Security', 'index.html')
    );
});

// Admin Login
app.get('/admin', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'Admins', 'index.html')
    );
});

// Admin Dashboard
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'Admins', 'dashboard.html')
    );
});

// Security Dashboard
app.get('/security/dashboard', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'Security', 'dashboard.html')
    );
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'VMS Server Running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date()
    });
});

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {

    console.error('Global Error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// ======================================================
// START SERVER
// ======================================================

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`

=========================================
🚀 Visitor Management System Started
=========================================
Environment : ${process.env.NODE_ENV}
Port        : ${PORT}
URL         : ${process.env.APP_URL}
Health      : ${process.env.APP_URL}/health
=========================================

    `);

});