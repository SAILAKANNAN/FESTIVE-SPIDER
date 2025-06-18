const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

const app = express();

// Middleware
app.use(cookieParser());
// Replace your current body-parser middleware with these:
app.use(bodyParser.json({ limit: '50mb' })); // Increase JSON payload limit
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Increase URL-encoded payload limit // Increase limit for base64 images
app.use(express.static('public'));

// Database connection
mongoose.connect('mongodb+srv://festivespiderwebsite:kanna2006@cluster0.fbu0dvp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
// mongoose.connect('mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Product Schema with base64 image storage
// Updated Product Schema with size-specific pricing
const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    description: String,
    offerPercentage: Number,
    mrp: Number,
    sizePrices: [{
        size: String,
        price: Number
    }],
    mainImage: {
        data: String,
        contentType: String
    },
    additionalImages: [{
        data: String,
        contentType: String
    }],
    createdAt: { type: Date, default: Date.now }
});

// Updated Order Schema with customization
const orderSchema = new mongoose.Schema({
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    sizes: [{
        size: String,
        price: Number,
        quantity: Number
    }],
    mrp: Number,
    customization: {
        type: {
            type: String,
            enum: ['DTF', 'STONE_WORK', 'EMBROIDERY', 'CUSTOM']
        },
        customImage: String,
        customDescription: String,
        selectedDesign: String,
        additionalCost: Number
    },
    payment: {
        method: { type: String, default: 'QR_CODE' },
        qrCode: String,
        utrNumber: String,
        status: { type: String, default: 'Pending' }
    },
    phone: String,
    street: String,
    area: String,
    pincode: String,
    district: String,
    state: String,
    status: { type: String, default: 'Pending' },
    orderedAt: { type: Date, default: Date.now }
});

// Models
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// Routes

// Home Page
app.get('/', (req, res) => {
    if (req.cookies.adminLoggedIn === 'true') {
        return res.redirect('/admin');
    }
    res.send(`
       <!DOCTYPE html>
<html>
<head>

    <title>MyShop - Modern E-Commerce</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      :root {
    --primary: #121212;
    --secondary: #1a1a1a;
    --accent: #FFD700;
    --gold-light: #FFECB3;
    --gold-dark: #C9A227;
    --dark: #0a0a0a;
    --light: #f8f8f8;
    --success: #28a745;
    --danger: #dc3545;
    --warning: #ffc107;
    --gray: #6c757d;
    --text-on-gold: #2a2a2a;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Playfair Display', 'Times New Roman', serif;
}

body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--primary);
    color: var(--light);
    line-height: 1.6;
}

/* Luxury Gold Animations */
@keyframes goldPulse {
    0% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
    50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.6); }
    100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
}

@keyframes goldShine {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
}

@keyframes fadeInLuxury {
    from { 
        opacity: 0;
        transform: translateY(20px);
    }
    to { 
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes floatGold {
    0% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(2deg); }
    100% { transform: translateY(0) rotate(0deg); }
}

/* Header Styles */
header {
    background: var(--dark);
    color: var(--light);
    padding: 0.8rem 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 100;
    border-bottom: 1px solid rgba(255, 215, 0, 0.1);
    animation: fadeInLuxury 0.8s ease-out;
}

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.brand-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 1;
    min-width: 0;
}

h1 {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(to right, var(--accent), var(--gold-light));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    letter-spacing: 1px;
    transition: all 0.5s ease;
    font-family: 'Playfair Display', serif;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

h1::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--accent), transparent);
    transform: scaleX(0);
    transition: transform 0.5s ease;
}

h1:hover {
    transform: scale(1.02);
    text-shadow: 0 4px 12px rgba(255, 215, 0, 0.5);
}

h1:hover::after {
    transform: scaleX(1);
}

/* Navigation */
.desktop-nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.nav-links {
    display: flex;
    gap: 1.5rem;
}

.nav-links a {
    color: var(--light);
    text-decoration: none;
    font-weight: 500;
    position: relative;
    padding: 0.5rem 0;
    transition: all 0.4s ease;
    font-family: 'Montserrat', sans-serif;
    letter-spacing: 0.5px;
}

.nav-links a::after {
    content: '';
    position: absolute;
    width: 0;
    height: 1px;
    bottom: 0;
    left: 0;
    background: linear-gradient(to right, var(--accent), var(--gold-light));
    transition: width 0.4s ease, opacity 0.4s ease;
    opacity: 0;
}

.nav-links a:hover {
    color: var(--accent);
}

.nav-links a:hover::after {
    width: 100%;
    opacity: 1;
}

.login-link {
    margin-left: 1rem;
}

.login-link a {
    color: var(--text-on-gold);
    text-decoration: none;
    font-weight: 600;
    padding: 0.6rem 1.5rem;
    border-radius: 30px;
    background: linear-gradient(to right, var(--accent), var(--gold-light));
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
    position: relative;
    overflow: hidden;
    font-family: 'Montserrat', sans-serif;
    border: none;
}

.login-link a::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: 0.5s;
}

.login-link a:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

.login-link a:hover::before {
    left: 100%;
}

/* Mobile Menu */
.mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    color: var(--light);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.3rem;
    margin-left: 0.5rem;
    z-index: 101;
    transition: all 0.4s ease;
    flex-shrink: 0;
}

.mobile-menu-btn:hover {
    color: var(--accent);
    transform: rotate(90deg);
}

.mobile-menu {
    display: none;
    position: absolute;
    top: 100%;
    right: 1rem;
    background-color: var(--dark);
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
    z-index: 100;
    min-width: 220px;
    transform: translateY(-20px);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    overflow: hidden;
    border: 1px solid rgba(255, 215, 0, 0.1);
}

.mobile-menu.active {
    transform: translateY(0);
    opacity: 1;
}

.mobile-menu .nav-links {
    flex-direction: column;
    gap: 0;
}

.mobile-menu .nav-links a {
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    transition: all 0.3s ease;
    border-bottom: 1px solid rgba(255,255,255,0.05);
}

.mobile-menu .nav-links a:hover {
    background-color: rgba(255,215,0,0.05);
    padding-left: 1.8rem;
    color: var(--accent);
}

.mobile-menu .login-link {
    margin: 0;
}

.mobile-menu .login-link a {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    border-radius: 0;
    background: none;
    padding: 1rem 1.5rem;
    color: var(--light);
    box-shadow: none;
    justify-content: center;
    background-color: rgba(255,215,0,0.1);
}

.mobile-menu .login-link a:hover {
    background-color: rgba(255,215,0,0.2);
    color: var(--accent);
}

/* Luxury Banner */
.luxury-banner {
    background: var(--dark);
    border-radius: 0;
    padding: 2.5rem 1.5rem;
    margin: 0 auto;
    max-width: 100%;
    border: none;
    box-shadow: none;
    position: relative;
    overflow: hidden;
    animation: fadeInLuxury 0.8s ease-out 0.2s both;
    border-bottom: 1px solid rgba(255, 215, 0, 0.1);
}

.luxury-banner::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%);
    animation: goldShine 8s linear infinite;
    pointer-events: none;
}

.shop-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(to right, var(--accent), var(--gold-light));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 2px 10px rgba(255, 215, 0, 0.2);
    position: relative;
    display: inline-block;
    animation: fadeInLuxury 0.8s ease-out 0.3s both;
    font-weight: 700;
    letter-spacing: 1px;
}

.shop-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(to right, transparent, var(--accent), transparent);
}

.shop-description {
    font-size: 1.1rem;
    line-height: 1.8;
    color: rgba(255,255,255,0.8);
    max-width: 800px;
    margin: 0 auto;
    animation: fadeInLuxury 0.8s ease-out 0.4s both;
    font-family: 'Montserrat', sans-serif;
}

/* Luxury Product Grid */
main {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    animation: fadeInLuxury 0.8s ease-out;
}

#products-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    animation: fadeInLuxury 0.8s ease-out 0.2s both;
}

.product-card {
    background: linear-gradient(145deg, var(--secondary), var(--primary));
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    cursor: pointer;
    border: 1px solid rgba(255, 215, 0, 0.1);
    position: relative;
    animation: fadeInLuxury 0.5s ease-out;
    animation-fill-mode: both;
}

.product-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--accent), transparent);
    opacity: 0;
    transition: opacity 0.4s ease;
}

.product-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 15px 35px rgba(0,0,0,0.4), 0 0 15px rgba(255, 215, 0, 0.2);
    border-color: rgba(255, 215, 0, 0.3);
}

.product-card:hover::before {
    opacity: 1;
}

/* Staggered animation for product cards */
.product-card:nth-child(1) { animation-delay: 0.1s; }
.product-card:nth-child(2) { animation-delay: 0.2s; }
.product-card:nth-child(3) { animation-delay: 0.3s; }
.product-card:nth-child(4) { animation-delay: 0.4s; }
.product-card:nth-child(5) { animation-delay: 0.5s; }
.product-card:nth-child(6) { animation-delay: 0.6s; }
.product-card:nth-child(7) { animation-delay: 0.7s; }
.product-card:nth-child(8) { animation-delay: 0.8s; }

.product-image-container {
    overflow: hidden;
    position: relative;
}

.product-image {
    width: 100%;
    height: 220px;
    object-fit: cover;
    transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.product-card:hover .product-image {
    transform: scale(1.1);
    filter: brightness(1.1);
}

.product-info {
    padding: 1.5rem;
    position: relative;
}

.product-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--light);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.4s ease;
    font-family: 'Montserrat', sans-serif;
}

.product-card:hover .product-title {
    color: var(--accent);
}

.price-info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 1rem;
}

.current-price {
    font-weight: 700;
    color: var(--accent);
    font-size: 1.3rem;
    letter-spacing: 0.5px;
}

.original-price {
    text-decoration: line-through;
    color: var(--gray);
    font-size: 0.95rem;
}

.discount-badge {
    background: linear-gradient(to right, var(--accent), var(--gold-light));
    color: var(--text-on-gold);
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 700;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    animation: goldPulse 2.5s infinite;
    margin-left: auto;
}

/* Luxury Footer */
footer {
    background: var(--dark);
    color: var(--light);
    text-align: center;
    padding: 3rem 1rem;
    margin-top: 4rem;
    position: relative;
    border-top: 1px solid rgba(255, 215, 0, 0.1);
    animation: fadeInLuxury 0.8s ease-out;
}

footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--accent), transparent);
}

.copyright {
    font-size: 0.95rem;
    color: var(--accent);
    opacity: 0.8;
    transition: all 0.4s ease;
    letter-spacing: 0.5px;
}

.copyright:hover {
    opacity: 1;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

/* Loading Animation */
@keyframes spinGold {
    0% { 
        transform: rotate(0deg);
        box-shadow: 0 0 0 rgba(255, 215, 0, 0.3);
    }
    50% { 
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
    }
    100% { 
        transform: rotate(360deg);
        box-shadow: 0 0 0 rgba(255, 215, 0, 0.3);
    }
}

.loading-spinner {
    display: inline-block;
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 215, 0, 0.1);
    border-radius: 50%;
    border-top-color: var(--accent);
    animation: spinGold 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
    margin: 3rem auto;
    display: block;
}

/* Responsive Adjustments */
@media (max-width: 1200px) {
    #products-container {
        grid-template-columns: repeat(3, 1fr);
    }
    
    .product-card:nth-child(4) { animation-delay: 0.1s; }
    .product-card:nth-child(5) { animation-delay: 0.2s; }
    .product-card:nth-child(6) { animation-delay: 0.3s; }
    .product-card:nth-child(7) { animation-delay: 0.4s; }
    .product-card:nth-child(8) { animation-delay: 0.5s; }
}

@media (max-width: 900px) {
    .luxury-banner {
        padding: 2rem 1.5rem;
    }
    
    .shop-title {
        font-size: 1.8rem;
    }
    
    .shop-description {
        font-size: 1rem;
    }
}

@media (max-width: 768px) {
    .mobile-menu-btn {
        display: block;
    }
    
    .desktop-nav {
        display: none;
    }
    
    .mobile-menu {
        display: block;
    }
    
    #products-container {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
    }
    
    main {
        padding: 1.5rem;
    }
    
    .product-image {
        height: 180px;
    }
    
    .product-card:nth-child(3) { animation-delay: 0.1s; }
    .product-card:nth-child(4) { animation-delay: 0.2s; }
    .product-card:nth-child(5) { animation-delay: 0.3s; }
    .product-card:nth-child(6) { animation-delay: 0.4s; }
    .product-card:nth-child(7) { animation-delay: 0.5s; }
    .product-card:nth-child(8) { animation-delay: 0.6s; }
    
    .luxury-banner {
        padding: 1.8rem 1.2rem;
    }
    
    .shop-title {
        font-size: 1.6rem;
    }
}

@media (max-width: 480px) {
    h1 {
        font-size: 1.3rem;
    }
    
    .header-container {
        padding: 0.5rem;
    }
    
    #products-container {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
    
    .product-image {
        height: 150px;
    }
    
    .mobile-menu {
        right: 0.5rem;
        min-width: 180px;
    }
    
    .luxury-banner {
        padding: 1.5rem 1rem;
    }
    
    .shop-title {
        font-size: 1.4rem;
        margin-bottom: 1rem;
    }
    
    .shop-description {
        font-size: 0.9rem;
    }
    
    .product-card {
        animation-delay: 0s !important;
    }
    
    .product-info {
        padding: 1rem;
    }
    
    .product-title {
        font-size: 1rem;
        margin-bottom: 0.8rem;
    }
    
    .current-price {
        font-size: 1.1rem;
    }
    
    .original-price {
        font-size: 0.85rem;
    }
    
    .discount-badge {
        font-size: 0.75rem;
        padding: 0.2rem 0.6rem;
    }
    
    footer {
        padding: 2rem 1rem;
    }
}

/* Luxury Scrollbar */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: var(--primary);
}

::-webkit-scrollbar-thumb {
    background: linear-gradient(var(--accent), var(--gold-dark));
    border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--accent);
}

/* Focus styles for accessibility */
a:focus, button:focus, input:focus {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.3);
}

/* Smooth scrolling */
html {
    scroll-behavior: smooth;
}
    </style>
</head>
<body>

    <header>
        <div class="header-container">
            <div class="brand-nav">
                <h1>FESTIVE SPIDER</h1>
            </div>
            
            <button class="mobile-menu-btn" aria-label="Menu">
                <i class="fas fa-bars"></i>
            </button>
            
            <div class="desktop-nav">
                <div class="nav-links">
                    <a href="/about">About Us</a>
                    <a href="/contact">Contact</a>
                </div>
                <div class="login-link">
                    <a href="/login">Login</a>
                </div>
            </div>
            
            <!-- Mobile Menu Dropdown -->
            <div class="mobile-menu">
                <div class="nav-links">
                    <a href="/about"><i class="fas fa-info-circle"></i> About Us</a>
                    <a href="/contact"><i class="fas fa-envelope"></i> Contact</a>
                </div>
                <div class="login-link">
                    <a href="/login"><i class="fas fa-user"></i> Login</a>
                </div>
            </div>
        </div>
    </header>

    <div class="luxury-banner">
        <h2 class="shop-title">✨ WED AURA </h2>
        <p class="shop-description">
             From the house festive spider 
Elegant wedding wear specialist.
        </p>
    </div>
    
    <main>
        <div id="products-container">
            <!-- Products will be loaded here -->
        </div>
    </main>
    
    <footer>
        <p class="copyright">&copy; <span id="current-year"></span> FESTIVE SPIDER. All rights reserved.</p>
    </footer>
    
    <script>
        // Mobile menu toggle functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Set current year in footer
            document.getElementById('current-year').textContent = new Date().getFullYear();
            
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            const mobileMenu = document.querySelector('.mobile-menu');
            
            // Toggle mobile menu
            mobileMenuBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                mobileMenu.classList.toggle('active');
                mobileMenuBtn.innerHTML = mobileMenu.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!mobileMenu.contains(e.target) && e.target !== mobileMenuBtn) {
                    mobileMenu.classList.remove('active');
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
            
            // Close menu when clicking on a link
            document.querySelectorAll('.mobile-menu a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                });
            });
            
            // Load products
            function loadProducts() {
                const container = document.getElementById('products-container');
                container.innerHTML = '<div class="loading-spinner"></div>';
                
                fetch('/api/products')
                    .then(response => response.json())
                    .then(products => {
                        container.innerHTML = '';
                        
                       products.forEach((product, index) => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product-card';
    productDiv.style.animationDelay = (index * 0.1) + 's';

    const discountedPrice = (product.mrp * (1 - product.offerPercentage / 100)).toFixed(2);
    const originalPrice = product.mrp.toFixed(2);

    productDiv.innerHTML = 
        '<div class="product-image-container">' +
            '<img src="' + product.mainImage.data + '" alt="' + product.name + '" class="product-image">' +
        '</div>' +
        '<div class="product-info">' +
            '<h3 class="product-title">' + product.name + '</h3>' +
            '<div class="price-info">' +
                '<span class="current-price">' + discountedPrice + '</span>' +
                '<span class="original-price">' + originalPrice + '</span>' +
                '<span class="discount-badge">' + product.offerPercentage + '% OFF</span>' +
            '</div>' +
        '</div>';

    productDiv.addEventListener('click', function () {
        window.location.href = '/product/' + product._id;
    });

    container.appendChild(productDiv);
});

                    })
                    .catch(error => {
                        console.error('Error loading products:', error);
                        container.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--accent);">Failed to load products. Please try again later.</p>';
                    });
            }
            
            // Load products when page loads
            loadProducts();
        });
    </script>
</body>
</html>
    `);
});

// About Us Page
app.get('/about', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MyShop - About Us</title>
           <style>
    /* Shared Base Styles */
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Arial', sans-serif;
    }
    
    body {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    
    .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }
    
    .logo-nav {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }
    
    h1 {
        margin-right: 2rem;
        color: #d4af37;
        font-size: 1.5rem;
    }
    
    nav {
        display: flex;
        flex-wrap: wrap;
    }
    
    nav a {
        color: #ffffff;
        text-decoration: none;
        margin-right: 1rem;
        padding: 0.5rem;
        transition: color 0.3s;
    }
    
    nav a:hover {
        color: #d4af37;
    }
    
    .login-btn {
        background-color: #d4af37;
        color: #000000;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
        transition: all 0.3s;
        font-weight: bold;
        border: none;
        cursor: pointer;
    }
    
    .login-btn:hover {
        background-color: #c9a227;
    }
    
    main {
        flex: 1;
        max-width: 1200px;
        margin: 2rem auto;
        padding: 2rem;
        border-radius: 8px;
    }
    
    h2 {
        margin-bottom: 1.5rem;
        font-weight: 600;
    }
    
    .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.5rem 0;
    }
    
    .footer-content p {
        margin: 0.5rem 0;
        color: #ffffff;
    }
    
    /* Shared Responsive Adjustments */
    @media (max-width: 768px) {
        .header-container {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .logo-nav {
            margin-bottom: 1rem;
            width: 100%;
            justify-content: space-between;
        }
        
        nav {
            margin-top: 1rem;
            width: 100%;
        }
        
        h1 {
            margin-right: 0;
            margin-bottom: 0.5rem;
        }
    }
    
    @media (max-width: 576px) {
        h1 {
            font-size: 1.3rem;
        }
        
        h2 {
            font-size: 1.5rem;
        }
        
        nav a {
            margin-right: 0.5rem;
            padding: 0.3rem;
            font-size: 0.9rem;
        }
        
        .login-btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
        }
        
        main {
            padding: 1.5rem;
        }
    }
</style>
<style>
    /* About Page Specific Styles */
    .about-page {
        background-color: #ffffff;
    }
    
    .about-header {
        background-color: #000000;
        border-bottom: 2px solid #d4af37;
    }
    
    .about-main {
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    
    .about-title {
        color: #000000;
        position: relative;
        padding-left: 15px;
    }
    
    .about-title:before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 4px;
        background-color: #d4af37;
    }
    
    .about-content p {
        color: #333333;
        margin-bottom: 1.2rem;
    }
    
    .about-footer {
        background-color: #000000;
        border-top: 2px solid #d4af37;
    }
    
    /* Responsive Adjustments for About Page */
    @media (max-width: 768px) {
        .about-main {
            padding: 1.5rem;
        }
        
        .about-title {
            font-size: 1.6rem;
        }
    }
    
    @media (max-width: 576px) {
        .about-main {
            padding: 1rem;
            margin: 1rem;
        }
        
        .about-title {
            font-size: 1.4rem;
        }
        
        .about-content p {
            font-size: 0.95rem;
        }
    }
</style>
        </head>
        <body>
            <header>
                <div class="header-container">
                    <div class="logo-nav">
                        <h1>FESTIVE SPIDER</h1>
                        <nav>
                            <a href="/" style="color:#d4af37 ">Home</a>
                            <a href="/about" style="color:#d4af37 ">About Us</a>
                            <a href="/contact" style="color:#d4af37 ">Contact Us</a>
                        </nav>
                    </div>
                    <div>
                        <a href="/login" class="login-btn">Login</a>
                    </div>
                </div>
            </header>
            
            <main>
                <h2>About Our Company</h2>
                <p>Welcome to MyShop, your premier destination for online shopping. We are committed to providing high-quality products and exceptional customer service.</p>
                <p>Founded in 2023, our mission is to make online shopping easy, enjoyable, and accessible to everyone. We carefully curate our product selection to ensure we offer only the best items to our customers.</p>
                <p>Our team consists of passionate individuals dedicated to creating the best possible shopping experience for you. We value your trust and strive to exceed your expectations with every order.</p>
            </main>
            
            <footer>
                <div class="footer-content">
                    <p>© 2023 MyShop. All rights reserved.</p>
                    <p>Developed by FESTIVE SPIDER</p>
                    <p>Email: spiderfestive@gmail.com | Phone: 9150448066</p>
                    <p>Address: 29a, Rose Garden, South Ukkadam, 641001</p>
                </div>
            </footer>
        </body>
        </html>
    `);
});

// Contact Us Page
app.get('/contact', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MyShop - Contact Us</title>
            <style>
    /* Shared Base Styles */
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Arial', sans-serif;
    }
    
    body {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    
    .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }
    
    .logo-nav {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }
    
    h1 {
        margin-right: 2rem;
        color: #d4af37;
        font-size: 1.5rem;
    }
    
    nav {
        display: flex;
        flex-wrap: wrap;
    }
    
    nav a {
        color: #ffffff;
        text-decoration: none;
        margin-right: 1rem;
        padding: 0.5rem;
        transition: color 0.3s;
    }
    
    nav a:hover {
        color: #d4af37;
    }
    
    .login-btn {
        background-color: #d4af37;
        color: #000000;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
        transition: all 0.3s;
        font-weight: bold;
        border: none;
        cursor: pointer;
    }
    
    .login-btn:hover {
        background-color: #c9a227;
    }
    
    main {
        flex: 1;
        max-width: 1200px;
        margin: 2rem auto;
        padding: 2rem;
        border-radius: 8px;
    }
    
    h2 {
        margin-bottom: 1.5rem;
        font-weight: 600;
    }
    
    .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.5rem 0;
    }
    
    .footer-content p {
        margin: 0.5rem 0;
        color: #ffffff;
    }
    
    /* Shared Responsive Adjustments */
    @media (max-width: 768px) {
        .header-container {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .logo-nav {
            margin-bottom: 1rem;
            width: 100%;
            justify-content: space-between;
        }
        
        nav {
            margin-top: 1rem;
            width: 100%;
        }
        
        h1 {
            margin-right: 0;
            margin-bottom: 0.5rem;
        }
    }
    
    @media (max-width: 576px) {
        h1 {
            font-size: 1.3rem;
        }
        
        h2 {
            font-size: 1.5rem;
        }
        
        nav a {
            margin-right: 0.5rem;
            padding: 0.3rem;
            font-size: 0.9rem;
        }
        
        .login-btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
        }
        
        main {
            padding: 1.5rem;
        }
    }
</style>
<style>
    /* Contact Page Specific Styles */
    .contact-page {
        background-color: #f9f9f9;
    }
    
    .contact-header {
        background-color: #000000;
        border-bottom: 2px solid #d4af37;
    }
    
    .contact-main {
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    
    .contact-title {
        color: #000000;
        position: relative;
    }
    
    .contact-title:after {
        content: "";
        display: block;
        width: 60px;
        height: 3px;
        background-color: #d4af37;
        margin-top: 10px;
    }
    
    .contact-info {
        background-color: #f8f8f8;
        padding: 1.5rem;
        border-radius: 6px;
        border-left: 4px solid #d4af37;
    }
    
    .contact-info p {
        color: #333333;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
    }
    
    .contact-info p i {
        color: #d4af37;
        margin-right: 10px;
        width: 20px;
        text-align: center;
    }
    
    .contact-footer {
        background-color: #000000;
        border-top: 2px solid #d4af37;
    }
    
    /* Responsive Adjustments for Contact Page */
    @media (max-width: 768px) {
        .contact-main {
            padding: 1.5rem;
        }
        
        .contact-title {
            font-size: 1.6rem;
        }
        
        .contact-info {
            padding: 1.2rem;
        }
    }
    
    @media (max-width: 576px) {
        .contact-main {
            padding: 1rem;
            margin: 1rem;
        }
        
        .contact-title {
            font-size: 1.4rem;
        }
        
        .contact-info p {
            font-size: 0.95rem;
        }
    }
    
    @media (max-width: 400px) {
        .contact-info {
            padding: 1rem;
        }
        
        .contact-info p i {
            margin-right: 8px;
        }
    }
</style>
        </head>
        <body>
            <header>
                <div class="header-container">
                    <div class="logo-nav">
                        <h1>FESTIVE SPIDER </h1>
                        <nav>
                            <a href="/" style="color:#d4af37 ">Home</a>
                            <a href="/about" style="color:#d4af37 ">About Us</a>
                            <a href="/contact" style="color:#d4af37 ">Contact Us</a>
                        </nav>
                    </div>
                    <div>
                        <a href="/login" class="login-btn">Login</a>
                    </div>
                </div>
            </header>
            
            <main>
                <h2>Contact Us</h2>
                <p>We'd love to hear from you! Whether you have a question about our products, need assistance with an order, or just want to share feedback, please reach out to us.</p>
                
                <div class="contact-info">
                    <p>Email:spiderfestive@gmail.com</p>
                    <p>Phone: 9150448066
</p>
                    <p>Address:  29a , rose garden , south ukkadam 641001</p>
                </div>
            </main>
            
            <footer>
                <div class="footer-content">
                    <p>© 2023 MyShop. All rights reserved.</p>
                    <p>Developed by FESTIVE SPIDER</p>
                    <p>Email: spiderfestive@gmail.com | Phone: 9150448066</p>
                    <p>Address: 29a, Rose Garden, South Ukkadam, 641001</p>
                </div>
            </footer>
        </body>
        </html>
    `);
});
// Login Page
app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Login</title>
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    background-color: #f8f9fa;
                }
                .navbar-brand {
                    font-weight: bold;
                }
                .login-container {
                    max-width: 500px;
                    margin: 50px auto;
                    padding: 30px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .login-title {
                    text-align: center;
                    margin-bottom: 30px;
                    color: #343a40;
                }
                .form-label {
                    font-weight: 500;
                }
                .btn-login {
                    width: 100%;
                    padding: 10px;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container">
                    <a class="navbar-brand" href="/">MyShop</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ms-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/about">About Us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/contact">Contact Us</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div class="container">
                <div class="login-container">
                    <h2 class="login-title">Admin Login</h2>
                    <form action="/login" method="POST">
                        <div class="mb-3">
                            <label for="phone" class="form-label">Phone:</label>
                            <input type="text" class="form-control" id="phone" name="phone" required>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password:</label>
                            <input type="password" class="form-control" id="password" name="password" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-login">Login</button>
                    </form>
                </div>
            </div>

            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
});

// Login POST
app.post('/login', (req, res) => {
    const { phone, password } = req.body;
    if (phone === 'festivespider' && password === 'festivespider' ) {
        res.cookie('adminLoggedIn', 'true', { maxAge: 365 * 24 * 60 * 60 * 1000 });
        res.redirect('/admin');
    } else {
        res.redirect('/login?error=1');
    }
});

// Logout
app.get('/logout', (req, res) => {
    res.clearCookie('adminLoggedIn');
    res.redirect('/');
});

// Admin Dashboard
app.get('/admin', (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Dashboard</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
                :root {
                    --primary-color: #4361ee;
                    --secondary-color: #3f37c9;
                    --accent-color: #4895ef;
                    --danger-color: #f72585;
                    --success-color: #4cc9f0;
                    --dark-color: #2b2d42;
                    --light-color: #f8f9fa;
                    --gray-color: #6c757d;
                    --border-radius: 8px;
                    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    --transition: all 0.3s ease;
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                body {
                    background-color: #f8fafc;
                    color: #1e293b;
                    line-height: 1.6;
                }
                
                header {
                    background-color: white;
                    color: var(--dark-color);
                    padding: 0.75rem 2rem;
                    box-shadow: var(--box-shadow);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                
                .header-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .logo i {
                    color: var(--primary-color);
                    font-size: 1.5rem;
                }
                
                .logo h1 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    background: linear-gradient(to right, var(--primary-color), var(--accent-color));
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }
                
                nav {
                    display: flex;
                    gap: 1.5rem;
                }
                
                nav a {
                    color: var(--gray-color);
                    text-decoration: none;
                    font-weight: 500;
                    padding: 0.5rem 0;
                    position: relative;
                    transition: var(--transition);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                nav a:hover {
                    color: var(--primary-color);
                }
                
                nav a.active {
                    color: var(--primary-color);
                }
                
                nav a.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background-color: var(--primary-color);
                    border-radius: 2px;
                }
                
                .user-actions a {
                    color: var(--gray-color);
                    text-decoration: none;
                    font-weight: 500;
                    transition: var(--transition);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .user-actions a:hover {
                    color: var(--danger-color);
                }
                
                main {
                    max-width: 1200px;
                    margin: 2rem auto;
                    padding: 0 2rem;
                }
                
                .dashboard-header {
                    margin-bottom: 2rem;
                }
                
                .dashboard-header h2 {
                    font-size: 1.75rem;
                    color: var(--dark-color);
                    margin-bottom: 0.5rem;
                }
                
                .dashboard-header p {
                    color: var(--gray-color);
                }
                
                #products-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-top: 2rem;
                }
                
                .product-card {
                    background: white;
                    border-radius: var(--border-radius);
                    overflow: hidden;
                    box-shadow: var(--box-shadow);
                    transition: transform 0.3s, box-shadow 0.3s;
                    display: flex;
                    flex-direction: column;
                }
                
                .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }
                
                .product-image {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    border-bottom: 1px solid #eee;
                }
                
                .product-content {
                    padding: 1.5rem;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                }
                
                .product-title {
                    font-size: 1.1rem;
                    color: var(--dark-color);
                    margin-bottom: 0.5rem;
                }
                
                .product-description {
                    color: var(--gray-color);
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    flex-grow: 1;
                }
                
                .product-price {
                    margin-bottom: 1.5rem;
                }
                
                .current-price {
                    font-weight: 600;
                    color: var(--primary-color);
                    font-size: 1.1rem;
                }
                
                .original-price {
                    color: var(--gray-color);
                    text-decoration: line-through;
                    font-size: 0.9rem;
                    margin: 0 0.5rem;
                }
                
                .discount {
                    color: var(--success-color);
                    font-weight: 500;
                    font-size: 0.9rem;
                }
                
                .product-actions {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: auto;
                }
                
                .btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    font-weight: 500;
                    transition: var(--transition);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }
                
                .btn-edit {
                    background-color: var(--accent-color);
                    color: white;
                }
                
                .btn-edit:hover {
                    background-color: var(--secondary-color);
                }
                
                .btn-delete {
                    background-color: #f8f9fa;
                    color: var(--danger-color);
                    border: 1px solid #e9ecef;
                }
                
                .btn-delete:hover {
                    background-color: var(--danger-color);
                    color: white;
                }
                
                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    background: white;
                    border-radius: var(--border-radius);
                    box-shadow: var(--box-shadow);
                    grid-column: 1 / -1;
                }
                
                .empty-state i {
                    font-size: 3rem;
                    color: var(--gray-color);
                    margin-bottom: 1rem;
                }
                
                .empty-state h3 {
                    color: var(--dark-color);
                    margin-bottom: 0.5rem;
                }
                
                .empty-state p {
                    color: var(--gray-color);
                    margin-bottom: 1.5rem;
                }
                
                .btn-add {
                    background-color: var(--primary-color);
                    color: white;
                    text-decoration: none;
                }
                
                .btn-add:hover {
                    background-color: var(--secondary-color);
                }
                
                @media (max-width: 768px) {
                    .header-container {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    
                    nav {
                        width: 100%;
                        overflow-x: auto;
                        padding-bottom: 0.5rem;
                    }
                    
                    #products-container {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        </head>
        <body>
            <header>
                <div class="header-container">
                    <div class="logo">
                        <i class="fas fa-store-alt"></i>
                        <h1>MyShop Admin</h1>
                    </div>
                    
                    <nav>
                        <a href="/admin" class="active">
                            <i class="fas fa-home"></i>
                            <span>Dashboard</span>
                        </a>
                        <a href="/admin/orders">
                            <i class="fas fa-shopping-bag"></i>
                            <span>Orders</span>
                        </a>
                       
                        <a href="/admin/add-product">
                            <i class="fas fa-plus-circle"></i>
                            <span>Add Product</span>
                        </a>
                    </nav>
                    
                    <div class="user-actions">
                        <a href="/logout">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </a>
                    </div>
                </div>
            </header>
            
            <main>
                <div class="dashboard-header">
                    <h2>Welcome to Admin Dashboard</h2>
                    <p>Manage your products, orders, and store settings from here.</p>
                </div>
                
                <div id="products-container">
                    <!-- Products will be loaded here -->
                    <div class="empty-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <h3>Loading Products...</h3>
                        <p>Please wait while we load your products</p>
                    </div>
                </div>
            </main>
            
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    fetch('/api/products')
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(products => {
                            const container = document.getElementById('products-container');
                            
                            if (products.length === 0) {
                                container.innerHTML = \`
                                    <div class="empty-state">
                                        <i class="fas fa-box-open"></i>
                                        <h3>No Products Found</h3>
                                        <p>You haven't added any products yet. Get started by adding your first product.</p>
                                        <a href="/admin/add-product" class="btn btn-add">
                                            <i class="fas fa-plus"></i>
                                            Add Product
                                        </a>
                                    </div>
                                \`;
                                return;
                            }
                            
                            container.innerHTML = '';
                            
                            products.forEach(product => {
                                const productDiv = document.createElement('div');
                                productDiv.className = 'product-card';
                                productDiv.innerHTML = \`
                                    <img src="\${product.mainImage?.data || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                                         alt="\${product.name}" 
                                         class="product-image">
                                    <div class="product-content">
                                        <h3 class="product-title">\${product.name}</h3>
                                        <p class="product-description">\${product.description?.substring(0, 80) || 'No description available'}...</p>
                                        
                                        <div class="product-price">
                                            <span class="current-price">₹\${product.price || '0'}</span>
                                            \${product.mrp ? \`<span class="original-price">₹\${product.mrp}</span>\` : ''}
                                            \${product.offerPercentage ? \`<span class="discount">\${product.offerPercentage}% off</span>\` : ''}
                                        </div>
                                        
                                        <div class="product-actions">
                                            <a href="/admin/edit-product/\${product._id}" class="btn btn-edit">
                                                <i class="fas fa-edit"></i>
                                                Edit
                                            </a>
                                            <button onclick="deleteProduct('\${product._id}')" class="btn btn-delete">
                                                <i class="fas fa-trash-alt"></i>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                \`;
                                container.appendChild(productDiv);
                            });
                        })
                        .catch(error => {
                            console.error('Error loading products:', error);
                            const container = document.getElementById('products-container');
                            container.innerHTML = \`
                                <div class="empty-state">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <h3>Error Loading Products</h3>
                                    <p>\${error.message}</p>
                                    <button onclick="window.location.reload()" class="btn btn-add">
                                        <i class="fas fa-sync-alt"></i>
                                        Try Again
                                    </button>
                                </div>
                            \`;
                        });
                });
                    
                function deleteProduct(id) {
                    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                        fetch(\`/api/products/\${id}\`, {
                            method: 'DELETE'
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to delete product');
                            }
                            return response.json();
                        })
                        .then(() => {
                            // Show success message
                            const alert = document.createElement('div');
                            alert.style.position = 'fixed';
                            alert.style.top = '20px';
                            alert.style.right = '20px';
                            alert.style.padding = '1rem';
                            alert.style.backgroundColor = '#4BB543';
                            alert.style.color = 'white';
                            alert.style.borderRadius = '4px';
                            alert.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                            alert.style.zIndex = '1000';
                            alert.style.display = 'flex';
                            alert.style.alignItems = 'center';
                            alert.style.gap = '0.5rem';
                            alert.innerHTML = \`
                                <i class="fas fa-check-circle"></i>
                                <span>Product deleted successfully</span>
                            \`;
                            document.body.appendChild(alert);
                            
                            // Remove after 3 seconds
                            setTimeout(() => {
                                alert.style.opacity = '0';
                                setTimeout(() => {
                                    document.body.removeChild(alert);
                                    window.location.reload();
                                }, 300);
                            }, 3000);
                        })
                        .catch(error => {
                            console.error('Error deleting product:', error);
                            alert('Failed to delete product: ' + error.message);
                        });
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// Admin Orders Page
// View Product Page - Updated with size validation
// View Product Page with Fixed Customization
// View Product Page with Fixed Customization
app.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Check if product has age ranges (like "5-6") or just standard sizes
        const hasAgeRanges = product.sizePrices.some(sp => sp.size.match(/^\d+-\d+$/));
        const minQuantity = hasAgeRanges ? 5 : 1;
        const quantityMessage = hasAgeRanges ? 
            'Minimum order quantity is 5 items. Please add more items to proceed.' : 
            'Please select at least one size';
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${product.name} | MyShop</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
               <style>
    /* Base Styles */
    body {
        background-color: #ffffff;
        color: #000000;
        font-family: 'Arial', sans-serif;
    }
    
    /* Navigation */
    .nav-bg {
        background-color: #000000;
    }
    .navbar-brand {
        color: #d4af37 !important; /* Gold */
        font-weight: bold;
    }
    .nav-link {
        color: #ffffff !important;
    }
    .nav-link:hover {
        color: #d4af37 !important;
    }
    .btn-outline-light {
        color: #ffffff;
        border-color: #ffffff;
    }
    .btn-outline-light:hover {
        background-color: #d4af37;
        border-color: #d4af37;
    }
    
    /* Product Card */
    .card {
        border: 1px solid #e0e0e0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    .card-header {
        background-color: #000000;
        color: #ffffff;
    }
    .card-title {
        color: #000000;
        font-weight: bold;
    }
    
    /* Buttons */
    .btn-checkout {
        background-color: #d4af37;
        color: #000000;
        border: none;
        font-weight: bold;
    }
    .btn-checkout:hover {
        background-color: #c9a227;
        color: #000000;
    }
    .btn-outline-secondary {
        border-color: #000000;
        color: #000000;
    }
    .btn-outline-secondary:hover {
        background-color: #000000;
        color: #ffffff;
    }
    
    /* Price and Discount */
    .price-text {
        color: #d4af37;
        font-weight: bold;
    }
    .original-price {
        text-decoration: line-through;
        color: #777777;
    }
    .discount-badge {
        background-color: #000000;
        color: #d4af37;
    }
    
    /* Product Thumbnails */
    .product-thumbnail {
        cursor: pointer;
        border: 1px solid #e0e0e0;
        transition: all 0.3s;
    }
    .product-thumbnail:hover, 
    .product-thumbnail.active {
        border-color: #d4af37;
    }
    
    /* Size Dropdown Styles */
    .size-dropdown {
        margin-bottom: 15px;
        border: 1px solid #e0e0e0;
        border-radius: 5px;
        overflow: hidden;
    }
    .size-dropdown-header {
        padding: 10px 15px;
        background-color: #f5f5f5;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        color: #000000;
    }
    .size-dropdown-header:hover {
        background-color: #e0e0e0;
    }
    .size-dropdown-content {
        padding: 15px;
        background-color: white;
        display: none;
    }
    .size-dropdown.active .size-dropdown-content {
        display: block;
    }
    .size-dropdown-toggle {
        transition: transform 0.3s;
        color: #d4af37;
    }
    .size-dropdown.active .size-dropdown-toggle {
        transform: rotate(180deg);
    }
    
    /* Tables */
    .table {
        color: #000000;
    }
    .table thead th {
        background-color: #f5f5f5;
        border-bottom: 2px solid #d4af37;
    }
    .table-bordered {
        border-color: #e0e0e0;
    }
    
    /* Footer */
    .footer-bg {
        background-color: #000000;
        color: #ffffff;
    }
    .footer-bg a {
        color: #d4af37;
    }
    .footer-bg a:hover {
        color: #ffffff;
    }
    .footer-bg hr {
        background-color: #d4af37;
    }
    
    /* Form Elements */
    .form-control {
        border-color: #e0e0e0;
    }
    .form-control:focus {
        border-color: #d4af37;
        box-shadow: 0 0 0 0.25rem rgba(212, 175, 55, 0.25);
    }
    
    /* Error Message */
    .text-danger {
        color: #dc3545 !important;
    }
    
    /* Responsive Adjustments */
    @media (max-width: 768px) {
        .product-thumbnail img {
            width: 60px !important;
            height: 60px !important;
        }
        .card-body {
            padding: 1rem;
        }
    }
    
    @media (max-width: 576px) {
        .quantity-input {
            width: 45px !important;
            font-size: 0.8rem;
        }
        .btn-sm {
            font-size: 0.7rem;
            padding: 2px 6px;
        }
        .table td, .table th {
            padding: 0.4rem;
            font-size: 0.8rem;
        }
        .shop-table h5 {
            font-size: 1rem;
        }
        .navbar-brand {
            font-size: 1.1rem;
        }
        .card-title {
            font-size: 1.3rem;
        }
    }
    
    @media (max-width: 400px) {
        .d-flex.flex-wrap.gap-2 {
            justify-content: center;
        }
        .product-thumbnail img {
            width: 50px !important;
            height: 50px !important;
        }
    }
</style>
            </head>
            <body>
                <!-- Navigation -->
                <nav class="navbar navbar-expand-lg navbar-dark nav-bg mb-4">
                    <div class="container">
                        <a class="navbar-brand fw-bold" href="/">FESTIVE SPIDER</a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav me-auto">
                                <li class="nav-item">
                                    <a class="nav-link" href="/">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/about">About Us</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/contact">Contact Us</a>
                                </li>
                            </ul>
                            <div class="d-flex">
                                <a class="btn btn-outline-light" href="/login">
                                    <i class="fas fa-user me-1"></i> Login
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>

                <!-- Product Section -->
                <div class="container mb-5">
                    <div class="row">
                        <!-- Product Images -->
                        <div class="col-md-6 mb-4">
                            <div class="card mb-3">
                                <div class="card-body text-center">
                                    <img id="mainProductImage" src="${product.mainImage.data}" alt="${product.name}" class="img-fluid" style="max-height: 400px; object-fit: contain;">
                                </div>
                            </div>
                            <div class="d-flex flex-wrap gap-2">
                                <div class="product-thumbnail active" onclick="changeMainImage('${product.mainImage.data}')">
                                    <img src="${product.mainImage.data}" class="img-thumbnail" style="width: 80px; height: 80px; object-fit: cover;">
                                </div>
                                ${product.additionalImages.map(img => `
                                    <div class="product-thumbnail" onclick="changeMainImage('${img.data}')">
                                        <img src="${img.data}" class="img-thumbnail" style="width: 80px; height: 80px; object-fit: cover;">
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Product Details -->
                        <div class="col-md-6">
                            <div class="card mb-4">
                                <div class="card-body">
                                    <h2 class="card-title">${product.name}</h2>
                                    <p class="text-muted">Category: ${product.category}</p>
                                    
                                    <div class="d-flex align-items-center mb-3">
                                        <span class="badge discount-badge text-white me-2">${product.offerPercentage}% OFF</span>
                                        <span class="original-price me-2">₹${product.mrp}</span>
                                    </div>
                                    
                                    <div class="mb-4">
                                        <h5>Description</h5>
                                        <p class="card-text">${product.description}</p>
                                    </div>
                                    
                                    <form id="buyForm" action="/checkout" method="POST" onsubmit="return validateForm()">
                                        <input type="hidden" name="productId" value="${product._id}">
                                        <input type="hidden" name="productName" value="${product.name}">
                                        <input type="hidden" name="mrp" value="${product.mrp}">
                                        
                                    
                                    
                                        <input type="hidden" id="minQuantity" value="${minQuantity}">
                                        
                                        <!-- Size and Quantity Selection -->
                                        <div class="mb-4 shop-table">
                                            <h5>Select Sizes and Quantities</h5>
                                            <p class="text-danger d-none" id="sizeError">${quantityMessage}</p>
                                            
                                            <!-- Age Sizes Dropdown -->
                                            ${product.sizePrices.filter(sp => sp.size.match(/^\d+-\d+$/)).length > 0 ? `
                                            <div class="size-dropdown" id="ageSizesDropdown">
                                                <div class="size-dropdown-header" onclick="toggleDropdown('ageSizesDropdown')">
                                                    <span>Ages</span>
                                                    <i class="fas fa-chevron-down size-dropdown-toggle"></i>
                                                </div>
                                                <div class="size-dropdown-content">
                                                    <div class="table-responsive">
                                                        <table class="table table-bordered align-middle text-center">
                                                            <thead class="table-light">
                                                                <tr>
                                                                    <th>Age</th>
                                                                    <th>Price</th>
                                                                    <th style="min-width: 120px;">Quantity</th>
                                                                    <th>Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                ${product.sizePrices.filter(sp => sp.size.match(/^\d+-\d+$/)).map(sp => `
                                                                    <tr>
                                                                        <td>${sp.size}</td>
                                                                        <td>₹${sp.price}</td>
                                                                        <td>
                                                                            <div class="d-flex justify-content-center align-items-center flex-nowrap gap-1">
                                                                                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="changeQuantity(this, -1, ${sp.price})">−</button>
                                                                                <input 
                                                                                    type="number" 
                                                                                    class="form-control form-control-sm text-center quantity-input" 
                                                                                    name="quantity_${sp.size}" 
                                                                                    min="0" 
                                                                                    value="0" 
                                                                                    style="width: 60px;" 
                                                                                    onchange="updateSizeTotal(this, ${sp.price})">
                                                                                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="changeQuantity(this, 1, ${sp.price})">+</button>
                                                                            </div>
                                                                        </td>
                                                                        <td class="sizeTotal" data-price="${sp.price}">₹0</td>
                                                                        <input type="hidden" name="size_${sp.size}" value="${sp.size}">
                                                                        <input type="hidden" name="price_${sp.size}" value="${sp.price}">
                                                                    </tr>
                                                                `).join('')}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                            ` : ''}
                                            
                                            <!-- Standard Sizes Dropdown -->
                                            ${product.sizePrices.filter(sp => !sp.size.match(/^\d+-\d+$/)).length > 0 ? `
                                            <div class="size-dropdown" id="standardSizesDropdown">
                                                <div class="size-dropdown-header" onclick="toggleDropdown('standardSizesDropdown')">
                                                    <span>Sizes</span>
                                                    <i class="fas fa-chevron-down size-dropdown-toggle"></i>
                                                </div>
                                                <div class="size-dropdown-content">
                                                    <div class="table-responsive">
                                                        <table class="table table-bordered align-middle text-center">
                                                            <thead class="table-light">
                                                                <tr>
                                                                    <th>Size</th>
                                                                    <th>Price</th>
                                                                    <th style="min-width: 120px;">Quantity</th>
                                                                    <th>Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                ${product.sizePrices.filter(sp => !sp.size.match(/^\d+-\d+$/)).map(sp => `
                                                                    <tr>
                                                                        <td>${sp.size}</td>
                                                                        <td>₹${sp.price}</td>
                                                                        <td>
                                                                            <div class="d-flex justify-content-center align-items-center flex-nowrap gap-1">
                                                                                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="changeQuantity(this, -1, ${sp.price})">−</button>
                                                                                <input 
                                                                                    type="number" 
                                                                                    class="form-control form-control-sm text-center quantity-input" 
                                                                                    name="quantity_${sp.size}" 
                                                                                    min="0" 
                                                                                    value="0" 
                                                                                    style="width: 60px;" 
                                                                                    onchange="updateSizeTotal(this, ${sp.price})">
                                                                                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="changeQuantity(this, 1, ${sp.price})">+</button>
                                                                            </div>
                                                                        </td>
                                                                        <td class="sizeTotal" data-price="${sp.price}">₹0</td>
                                                                        <input type="hidden" name="size_${sp.size}" value="${sp.size}">
                                                                        <input type="hidden" name="price_${sp.size}" value="${sp.price}">
                                                                    </tr>
                                                                `).join('')}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                            ` : ''}
                                            
                                            <div class="d-flex justify-content-end mt-2">
                                                <strong>Subtotal: </strong>
                                                <span id="subtotal" class="ms-2">₹0</span>
                                            </div>
                                        </div>
                                        
                                        <!-- Order Summary -->
                                        <div class="card border-primary mb-4">
                                            <div class="card-header bg-primary text-white">
                                                <h5 class="mb-0">Order Summary</h5>
                                            </div>
                                            <div class="card-body">
                                                <div class="d-flex justify-content-between mb-2">
                                                    <span>Product Subtotal:</span>
                                                    <span id="productSubtotal">₹0</span>
                                                </div>
                                                <hr>
                                                <div class="d-flex justify-content-between fw-bold">
                                                    <span>Total:</span>
                                                    <p>Delivery Charge: ₹100</p>
                                                    <span id="totalPrice">₹0</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button type="submit" class="btn btn-success btn-lg w-100 btn-checkout">
                                            <i class="fas fa-shopping-cart me-2"></i> Proceed to Checkout
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <footer class="footer-bg text-white py-4 mt-5">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-6">
                                <h5>FESTIVE SPIDER</h5>
                                <p>Quality products at affordable prices.</p>
                            </div>
                            <div class="col-md-3">
                                <h5>Quick Links</h5>
                                <ul class="list-unstyled">
                                    <li><a href="/" class="text-white">Home</a></li>
                                    <li><a href="/about" class="text-white">About Us</a></li>
                                    <li><a href="/contact" class="text-white">Contact Us</a></li>
                                </ul>
                            </div>
                            <div class="col-md-3">
                                <h5>Connect With Us</h5>
                                <div class="d-flex gap-3">
                                    <a href="#" class="text-white"><i class="fab fa-facebook-f"></i></a>
                                    <a href="#" class="text-white"><i class="fab fa-twitter"></i></a>
                                    <a href="#" class="text-white"><i class="fab fa-instagram"></i></a>
                                </div>
                            </div>
                        </div>
                        <hr class="my-3 bg-light">
                        <div class="text-center">
                            <p class="mb-0">&copy; ${new Date().getFullYear()} FESTIVE SPIDER. All rights reserved.</p>
                        </div>
                    </div>
                </footer>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                <script>
                    let selectedSizes = {};
                    let totalQuantity = 0;
                    
                    function changeMainImage(src) {
                        document.getElementById('mainProductImage').src = src;
                        document.querySelectorAll('.product-thumbnail').forEach(el => el.classList.remove('active'));
                        event.currentTarget.classList.add('active');
                    }
                    
                    function toggleDropdown(dropdownId) {
                        const dropdown = document.getElementById(dropdownId);
                        dropdown.classList.toggle('active');
                    }
                    
                    function validateForm() {
                        const minQuantity = parseInt(document.getElementById('minQuantity').value);
                        
                        if (Object.keys(selectedSizes).length === 0) {
                            document.getElementById('sizeError').classList.remove('d-none');
                            document.getElementById('sizeError').textContent = 'Please select at least one size';
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            return false;
                        }
                        
                        if (totalQuantity < minQuantity) {
                            document.getElementById('sizeError').classList.remove('d-none');
                            document.getElementById('sizeError').textContent = minQuantity === 5 ? 
                                'Minimum order quantity is 5 items. Please add more items to proceed.' : 
                                'Please select at least one size';
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            return false;
                        }
                        
                        return true;
                    }
                    
                    function updateSizeTotal(input, price) {
                        const quantity = parseInt(input.value) || 0;
                        const size = input.name.replace('quantity_', '');
                        const totalCell = input.closest('tr').querySelector('.sizeTotal');
                        const minQuantity = parseInt(document.getElementById('minQuantity').value);
                        
                        // Update total quantity
                        if (quantity > 0) {
                            if (selectedSizes[size]) {
                                totalQuantity -= selectedSizes[size].quantity;
                            }
                            selectedSizes[size] = { price, quantity };
                            totalQuantity += quantity;
                            totalCell.textContent = '₹' + (price * quantity);
                            document.getElementById('sizeError').classList.add('d-none');
                        } else {
                            if (selectedSizes[size]) {
                                totalQuantity -= selectedSizes[size].quantity;
                            }
                            delete selectedSizes[size];
                            totalCell.textContent = '₹0';
                            
                            if (Object.keys(selectedSizes).length === 0) {
                                document.getElementById('sizeError').classList.remove('d-none');
                                document.getElementById('sizeError').textContent = 'Please select at least one size';
                            } else if (totalQuantity < minQuantity) {
                                document.getElementById('sizeError').classList.remove('d-none');
                                document.getElementById('sizeError').textContent = minQuantity === 5 ? 
                                    'Minimum order quantity is 5 items. Please add more items to proceed.' : 
                                    'Please select at least one size';
                            }
                        }
                        
                        updateSubtotal();
                    }
                    
                    function changeQuantity(button, delta, price) {
                        var input = button.parentElement.querySelector('.quantity-input');
                        var current = parseInt(input.value) || 0;
                        current += delta;
                        if (current < 0) current = 0;
                        input.value = current;
                        updateSizeTotal(input, price);
                    }
                    
                    function updateSubtotal() {
                        let subtotal = 0;
                        for (const size in selectedSizes) {
                            subtotal += selectedSizes[size].price * selectedSizes[size].quantity;
                        }
                        document.getElementById('subtotal').textContent = '₹' + subtotal;
                        document.getElementById('productSubtotal').textContent = '₹' + subtotal;
                        updateTotal();
                    }
                    
                    function updateTotal() {
                        const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('₹', '')) || 0;
                        const total = subtotal + 100; // Adding delivery charge
                        
                        document.getElementById('totalPrice').textContent = '₹' + total;
                    }
                    
                    // Initialize dropdowns if they exist
                    document.addEventListener('DOMContentLoaded', function() {
                        const ageSizes = ${product.sizePrices.filter(sp => sp.size.match(/^\d+-\d+$/)).length > 0};
                        const standardSizes = ${product.sizePrices.filter(sp => !sp.size.match(/^\d+-\d+$/)).length > 0};
                        
                        if (ageSizes && standardSizes) {
                            // If both exist, open one by default
                            toggleDropdown('ageSizesDropdown');
                        } else if (ageSizes || standardSizes) {
                            // If only one exists, open it
                            toggleDropdown(ageSizes ? 'ageSizesDropdown' : 'standardSizesDropdown');
                        }
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading product');
    }
});
// Checkout Page - Updated to handle custom images
app.post('/checkout', async (req, res) => {
    const { productId, productName, mrp, ...formData } = req.body;
    
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Process sizes and quantities
        const sizes = [];
        let productSubtotal = 0;
        
        for (const key in formData) {
            if (key.startsWith('quantity_') && formData[key] > 0) {
                const size = key.replace('quantity_', '');
                const quantity = parseInt(formData[key]);
                const price = parseFloat(formData[`price_${size}`]);
                
                sizes.push({
                    size,
                    price,
                    quantity
                });
                
                productSubtotal += price * quantity;
            }
        }

        // Process customization
        let customization = null;
        let customizationCost = 0;
        
        if (formData.customize && formData.customizationType) {
            customization = {
                type: formData.customizationType,
                customImage: formData.customImage || null,
                customDescription: formData.customDescription || null,
                selectedDesign: formData.selectedDesign || null
            };
            
            switch(formData.customizationType) {
                case 'DTF': customizationCost = 75; break;
                case 'STONE_WORK': customizationCost = 200; break;
                case 'EMBROIDERY': customizationCost = 300; break;
                case 'CUSTOM': customizationCost = 150; break;
            }
            
            customization.additionalCost = customizationCost * sizes.reduce((total, item) => total + item.quantity, 0);
        }

        const total = productSubtotal + (customization?.additionalCost || 0);

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Checkout | MyShop</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                <style>
  :root {
    --primary: #D4AF37; /* Gold */
    --primary-dark: #B38B2D;
    --secondary: #F5F5F5; /* Light gray */
    --dark: #121212; /* Almost black */
    --light: #FFFFFF; /* Pure white */
    --gray: #E0E0E0; /* Light gray */
    --gray-dark: #616161; /* Dark gray */
    --success: #28a745;
    --shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    --transition: all 0.3s ease;
    --border: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Poppins', sans-serif;
    background-color: var(--secondary);
    color: var(--dark);
    line-height: 1.6;
  }
  
  /* Header Styles */
  header {
    background-color: var(--light);
    box-shadow: var(--shadow);
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid var(--gray);
  }
  
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 5%;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .logo {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--dark);
    text-decoration: none;
    display: flex;
    align-items: center;
  }
  
  .logo i {
    margin-right: 0.5rem;
    color: var(--primary);
  }
  
  .nav-links {
    display: flex;
    gap: 1.5rem;
  }
  
  .nav-links a {
    color: var(--dark);
    text-decoration: none;
    font-weight: 500;
    transition: var(--transition);
    position: relative;
  }
  
  .nav-links a:hover {
    color: var(--primary);
  }
  
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: var(--primary);
    transition: var(--transition);
  }
  
  .nav-links a:hover::after {
    width: 100%;
  }
  
  .auth-links a {
    padding: 0.5rem 1rem;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 500;
    transition: var(--transition);
  }
  
  .auth-links .login {
    color: var(--primary);
    border: 1px solid var(--primary);
  }
  
  .auth-links .login:hover {
    background-color: var(--primary);
    color: var(--dark);
  }
  
  /* Mobile Menu */
  .menu-toggle {
    display: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: var(--dark);
  }
  
  /* Main Content */
  .checkout-container {
    display: flex;
    max-width: 1400px;
    margin: 2rem auto;
    padding: 0 5%;
    gap: 2rem;
  }
  
  .checkout-form, .order-summary {
    background-color: var(--light);
    border-radius: 10px;
    padding: 2rem;
    box-shadow: var(--shadow);
    animation: fadeIn 0.5s ease forwards;
    border: var(--border);
  }
  
  .checkout-form {
    flex: 1.5;
  }
  
  .order-summary {
    flex: 1;
    position: sticky;
    top: 100px;
    align-self: flex-start;
  }
  
  h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: var(--dark);
    position: relative;
    padding-bottom: 0.5rem;
    font-weight: 600;
  }
  
  h2::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: var(--primary);
  }
  
  h3 {
    font-size: 1.3rem;
    margin: 1.5rem 0 1rem;
    color: var(--dark);
    font-weight: 600;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--dark);
  }
  
  input[type="text"] {
    width: 100%;
    padding: 0.8rem 1rem;
    border: var(--border);
    border-radius: 5px;
    font-family: inherit;
    font-size: 1rem;
    transition: var(--transition);
    background-color: var(--light);
    color: var(--dark);
  }
  
  input[type="text"]:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
  }
  
  .qr-container {
    text-align: center;
    margin: 1.5rem 0;
    padding: 1.5rem;
    background-color: var(--light);
    border-radius: 10px;
    animation: pulse 2s infinite;
    border: var(--border);
  }
  
  .qr-container img {
    max-width: 200px;
    margin: 0 auto;
    display: block;
  }
  
  .submit-btn {
    background-color: var(--primary);
    color: var(--dark);
    border: none;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 5px;
    cursor: pointer;
    width: 100%;
    transition: var(--transition);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .submit-btn:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
  }
  
  /* Order Summary Styles */
  .product-item {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: var(--border);
  }
  
  .product-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 5px;
    border: var(--border);
  }
  
  .product-details {
    flex: 1;
  }
  
  .product-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--dark);
  }
  
  .size-info {
    font-size: 0.9rem;
    color: var(--gray-dark);
    margin-bottom: 0.3rem;
  }
  
  .customization-info {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--gray);
  }
  
  .customization-info p {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: var(--gray-dark);
  }
  
  .custom-image {
    max-width: 100px;
    margin-top: 0.5rem;
    border-radius: 5px;
    border: var(--border);
  }
  
  .price-row {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
    padding: 0.5rem 0;
    color: var(--dark);
  }
  
  .price-row.total {
    font-weight: 600;
    font-size: 1.1rem;
    border-top: var(--border);
    margin-top: 1.5rem;
    padding-top: 1rem;
    color: var(--dark);
  }
  
  /* Payment Container Styles */
  .payment-container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    font-family: 'Poppins', sans-serif;
    background-color: var(--light);
    border-radius: 10px;
    box-shadow: var(--shadow);
    border: var(--border);
  }
  
  .payment-container h3 {
    color: var(--dark);
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: 600;
  }
  
  .payment-method {
    margin-bottom: 25px;
  }
  
  .qr-section {
    text-align: center;
    margin-bottom: 25px;
    padding: 20px;
    background-color: var(--light);
    border-radius: 8px;
    box-shadow: var(--shadow);
    border: var(--border);
  }
  
  .qr-section p {
    color: var(--gray-dark);
    margin-bottom: 15px;
  }
  
  #qrCode {
    width: 200px;
    height: 200px;
    margin: 0 auto 15px;
    border: var(--border);
    padding: 10px;
    background-color: var(--light);
  }
  
  .utr-input {
    margin-top: 15px;
  }
  
  .utr-input label {
    display: block;
    margin-bottom: 8px;
    color: var(--dark);
    font-weight: 500;
  }
  
  .utr-input input {
    width: 100%;
    max-width: 300px;
    padding: 10px;
    border: var(--border);
    border-radius: 4px;
    font-size: 16px;
    margin: 0 auto;
    display: block;
    background-color: var(--light);
    color: var(--dark);
  }
  
  .upi-apps {
    margin-top: 25px;
  }
  
  .upi-apps p {
    text-align: center;
    color: var(--gray-dark);
    margin-bottom: 15px;
  }
  
  .app-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  
  .app-buttons button {
    padding: 10px 15px;
    background-color: var(--dark);
    color: var(--light);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: var(--transition);
    min-width: 100px;
    border: 1px solid var(--dark);
  }
  
  .app-buttons button:hover {
    background-color: var(--primary);
    color: var(--dark);
    border-color: var(--primary);
    transform: translateY(-2px);
  }
  
  /* Footer Styles */
  footer {
    background-color: var(--dark);
    color: var(--light);
    padding: 3rem 5%;
    margin-top: 3rem;
  }
  
  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
  }
  
  .footer-column h3 {
    color: var(--light);
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    position: relative;
  }
  
  .footer-column h3::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 2px;
    background-color: var(--primary);
  }
  
  .footer-column ul {
    list-style: none;
  }
  
  .footer-column ul li {
    margin-bottom: 0.8rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .footer-column ul li i {
    color: var(--primary);
    width: 20px;
    text-align: center;
  }
  
  .footer-column ul li a {
    color: var(--gray);
    text-decoration: none;
    transition: var(--transition);
  }
  
  .footer-column ul li a:hover {
    color: var(--primary);
    padding-left: 5px;
  }
  
  .social-links {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .social-links a {
    color: var(--dark);
    background-color: var(--primary);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
  }
  
  .social-links a:hover {
    background-color: var(--light);
    transform: translateY(-3px);
  }
  
  .copyright {
    text-align: center;
    padding-top: 2rem;
    margin-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--gray);
    font-size: 0.9rem;
  }
  
  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
    70% { box-shadow: 0 0 0 15px rgba(212, 175, 55, 0); }
    100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
  }
  
  /* Responsive Styles */
  @media (max-width: 992px) {
    .checkout-container {
      flex-direction: column;
    }
    
    .order-summary {
      position: static;
    }
  }
  
  @media (max-width: 768px) {
    .navbar {
      padding: 1rem;
    }
    
    .nav-links {
      position: fixed;
      top: 70px;
      left: -100%;
      width: 80%;
      height: calc(100vh - 70px);
      background-color: var(--light);
      flex-direction: column;
      align-items: center;
      padding: 2rem 0;
      transition: var(--transition);
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }
    
    .nav-links.active {
      left: 0;
    }
    
    .menu-toggle {
      display: block;
    }
    
    .auth-links {
      display: none;
    }
    
    .product-item {
      flex-direction: column;
    }
    
    .product-image {
      width: 100%;
      height: auto;
    }
    
    .payment-container {
      padding: 15px;
      margin: 15px;
    }
    
    .app-buttons {
      gap: 8px;
    }
    
    .app-buttons button {
      padding: 8px 12px;
      font-size: 13px;
      min-width: 80px;
    }
    
    #qrCode {
      width: 180px;
      height: 180px;
    }
  }
  
  @media (max-width: 576px) {
    .checkout-form, .order-summary {
      padding: 1.5rem;
    }
    
    h2 {
      font-size: 1.5rem;
    }
    
    .qr-container img {
      max-width: 150px;
    }
    
    .payment-container {
      padding: 10px;
      margin: 10px;
    }
    
    .payment-container h3 {
      font-size: 20px;
    }
    
    .app-buttons button {
      padding: 6px 10px;
      font-size: 12px;
      min-width: 70px;
    }
    
    #qrCode {
      width: 160px;
      height: 160px;
    }
    
    .utr-input input {
      font-size: 14px;
      padding: 8px;
    }
  }
</style>
            </head>
            <body>
                <header>
                    <nav class="navbar">
                        <a href="/" class="logo">
                            <i class="fas fa-store"></i> FESTIVE SPIDER
                        </a>
                        
                        <div class="nav-links">
                            <a href="/">Home</a>
                            <a href="/about">About Us</a>
                            <a href="/contact">Contact Us</a>
                        </div>
                        
                        <div class="auth-links">
                            <a href="/login" class="login">Login</a>
                        </div>
                        
                        <div class="menu-toggle">
                            <i class="fas fa-bars"></i>
                        </div>
                    </nav>
                </header>
                
                <div class="checkout-container">
                    <div class="checkout-form">
                        <h2>Delivery Address</h2>
                        <form action="/complete-order" method="POST">
                            <input type="hidden" name="productId" value="${productId}">
                            <input type="hidden" name="productName" value="${productName}">
                            <input type="hidden" name="mrp" value="${mrp}">
                            
                            <input type="hidden" name="sizes" value='${JSON.stringify(sizes).replace(/'/g, "\\'")}'>
                            ${customization ? `
                                <input type="hidden" name="customizationType" value="${customization.type}">
                                ${customization.selectedDesign ? `<input type="hidden" name="selectedDesign" value="${customization.selectedDesign}">` : ''}
                                ${customization.customImage ? `<input type="hidden" name="customImage" value="${customization.customImage}">` : ''}
                                ${customization.customDescription ? `<input type="hidden" name="customDescription" value="${customization.customDescription}">` : ''}
                                <input type="hidden" name="customizationCost" value="${customization.additionalCost}">
                            ` : ''}
                            
                            <div class="form-group">
                                <label>Phone Number:</label>
                                <input type="text" name="phone" required>
                            </div>
                            <div class="form-group">
                                <label>Your Name & Street Address:</label>
                                <input type="text" name="street" required>
                            </div>
                            <div class="form-group">
                                <label>Area Name:</label>
                                <input type="text" name="area" required>
                            </div>
                            <div class="form-group">
                                <label>Pincode:</label>
                                <input type="text" name="pincode" required>
                            </div>
                            <div class="form-group">
                                <label>District:</label>
                                <input type="text" name="district" required>
                            </div>
                            <div class="form-group">
                                <label>State:</label>
                                <input type="text" name="state" required>
                            </div>
                            
<style>
  .payment-container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    font-family: 'Arial', sans-serif;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .payment-container h3 {
    color: #2c3e50;
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
  }
  
  .payment-method {
    margin-bottom: 25px;
  }
  
  .qr-section {
    text-align: center;
    margin-bottom: 25px;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .qr-section p {
    color: #555;
    margin-bottom: 15px;
  }
  
  #qrCode {
    width: 200px;
    height: 200px;
    margin: 0 auto 15px;
    border: 1px solid #eee;
    padding: 10px;
    background-color: white;
  }
  
  .utr-input {
    margin-top: 15px;
  }
  
  .utr-input label {
    display: block;
    margin-bottom: 8px;
    color: #555;
    font-weight: bold;
  }
  
  .utr-input input {
    width: 100%;
    max-width: 300px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    margin: 0 auto;
    display: block;
  }
  
  .upi-apps {
    margin-top: 25px;
  }
  
  .upi-apps p {
    text-align: center;
    color: #555;
    margin-bottom: 15px;
  }
  
  .app-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  
  .app-buttons button {
    padding: 10px 15px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
    min-width: 100px;
  }
  
  .app-buttons button:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .payment-container {
      padding: 15px;
      margin: 15px;
    }
    
    .app-buttons {
      gap: 8px;
    }
    
    .app-buttons button {
      padding: 8px 12px;
      font-size: 13px;
      min-width: 80px;
    }
    
    #qrCode {
      width: 180px;
      height: 180px;
    }
  }
  
  @media (max-width: 480px) {
    .payment-container {
      padding: 10px;
      margin: 10px;
    }
    
    .payment-container h3 {
      font-size: 20px;
    }
    
    .app-buttons button {
      padding: 6px 10px;
      font-size: 12px;
      min-width: 70px;
    }
    
    #qrCode {
      width: 160px;
      height: 160px;
    }
    
    .utr-input input {
      font-size: 14px;
      padding: 8px;
    }
  }
</style>

<div class="payment-container">
  <h3>Payment Information</h3>
  <div class="payment-method">
    <div class="qr-section">
      <p>Please make payment via QR code and enter UTR number below</p>
      <img id="qrCode" src="" alt="QR Code">

      <div class="utr-input">
        <label>UTR Number (12 digits):</label>
        <input type="text" name="utrNumber" pattern="[0-9]{12}" title="12 digit UTR number" required>
      </div>
    </div>

    <div class="upi-apps">
      <p>Or Pay Using:</p>
      <div class="app-buttons">
        <button onclick="pay('gpay')">Google Pay</button>
        <button onclick="pay('phonepe')">PhonePe</button>
        <button onclick="pay('paytm')">Paytm</button>
        <button onclick="pay('bhim')">BHIM</button>
        <button onclick="pay('amazon')">Amazon Pay</button>
        <button onclick="pay('mobikwik')">Mobikwik</button>
        <button onclick="pay('freecharge')">Freecharge</button>
        <button onclick="pay('airtel')">Airtel</button>
        <button onclick="pay('fampay')">FamPay</button>
      </div>
    </div>
  </div>
</div>

<script>
  const upiId = "7358862602@ybl";
  const name = "Mr. Sailakannan";
  const finalAmount = ${total + 100}; // You can replace 500 with your dynamic total

  const upiUrl = "upi://pay?pa=" + upiId + "&pn=" + encodeURIComponent(name) + "&am=" + finalAmount + "&cu=INR";
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?data=" + encodeURIComponent(upiUrl) + "&size=200x200";

  document.getElementById("qrCode").src = qrUrl;

  function pay(app) {
    const androidPackageNames = {
      gpay: "com.google.android.apps.nbu.paisa.user",
      phonepe: "com.phonepe.app",
      paytm: "net.one97.paytm",
      bhim: "in.org.npci.upiapp",
      amazon: "in.amazon.mShop.android.shopping",
      mobikwik: "com.mobikwik_new",
      freecharge: "com.freecharge.android",
      airtel: "com.myairtelapp",
      fampay: "com.fampay.in"
    };

    const packageName = androidPackageNames[app];

    // Android Chrome and other browsers that support intents
    if (navigator.userAgent.toLowerCase().includes("android")) {
      const intentUrl = "intent://pay?pa=" + upiId +
        "&pn=" + encodeURIComponent(name) +
        "&am=" + finalAmount +
        "&cu=INR#Intent;scheme=upi;package=" + packageName + ";end";

      window.location.href = intentUrl;

    } else if (navigator.userAgent.toLowerCase().includes("iphone") || navigator.userAgent.toLowerCase().includes("ipad")) {
      // iOS fallback – just open the UPI URL, user has to manually select the app
      window.location.href = upiUrl;

      // Optional alert for iOS users
      alert("iOS does not support automatic UPI redirection. Please copy and paste this UPI ID: " + upiId + " into your payment app.");
    } else {
      // Desktop or unsupported
      alert("This feature works best on a mobile device with a UPI app installed.");
    }
  }
</script>

                            
                            <button type="submit" class="submit-btn">Complete Order</button>
                        </form>
                    </div>
                    
                    <div class="order-summary">
                        <h2>Order Summary</h2>
                        <div>
    <div class="product-item">
        <img src="${product.mainImage.data}" alt="${productName}" class="product-image">
        <div class="product-details">
            <h3 class="product-title">${productName}</h3>
            ${sizes.map(size => `
                <p class="size-info">Size: ${size.size}, Qty: ${size.quantity}, Price: ₹${size.price * size.quantity}</p>
            `).join('')}
            
            ${customization ? `
                <div class="customization-info">
                    <p>Customization: ${customization.type}</p>
                    ${customization.selectedDesign ? `<p>Selected Design: ${customization.selectedDesign}</p>` : ''}
                    ${customization.customDescription ? `<p>Instructions: ${customization.customDescription}</p>` : ''}
                    ${customization.customImage ? `<img src="${customization.customImage}" class="custom-image">` : ''}
                </div>
            ` : ''}
        </div>
    </div>
    <div class="price-row">
        <span>Product Subtotal:</span>
        <span>₹${productSubtotal}</span>
    </div>
    ${customization ? `
        <div class="price-row">
            <span>Customization:</span>
            <span>₹${customization.additionalCost}</span>
        </div>
    ` : ''}
    <div class="price-row">
        <span>Delivery Charge:</span>
        <span>₹100</span>
    </div>
    <div class="price-row total">
        <span>Total:</span>
        <span>₹${total + 100}</span>
    </div>
</div>
                    </div>
                </div>
                
                <footer>
                    <div class="footer-content">
                        <div class="footer-column">
                            <h3>FESTIVE SPIDER</h3>
                            <p>Quality products with custom designs to match your unique style.</p>
                            <div class="social-links">
                                <a href="#"><i class="fab fa-facebook-f"></i></a>
                                <a href="#"><i class="fab fa-instagram"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                            </div>
                        </div>
                        <div class="footer-column">
                            <h3>Quick Links</h3>
                            <ul>
                                <li><a href="/">Home</a></li>
                                <li><a href="/about">About Us</a></li>
                                <li><a href="/contact">Contact Us</a></li>
                                <li><a href="#">Privacy Policy</a></li>
                            </ul>
                        </div>
                        <div class="footer-column">
                            <h3>Customer Service</h3>
                            <ul>
                                <li><a href="#">FAQs</a></li>
                                <li><a href="#">Shipping Policy</a></li>
                                <li><a href="#">Returns & Exchanges</a></li>
                                <li><a href="#">Size Guide</a></li>
                            </ul>
                        </div>
                        <div class="footer-column">
                            <h3>Contact Us</h3>
                            <ul>
                                <li><i class="fas fa-map-marker-alt"></i> 29a , rose garden , south ukkadam 641001</li>
                                <li><i class="fas fa-phone"></i> +91 9150448066</li>
                                <li><i class="fas fa-envelope"></i>   spiderfestive@gmail.com
</li>
                            </ul>
                        </div>
                    </div>
                    <div class="copyright">
                        &copy; ${new Date().getFullYear()} FESTIVE SPIDER. All rights reserved.
                    </div>
                </footer>
                
                <script>
                    // Mobile menu toggle
                    document.querySelector('.menu-toggle').addEventListener('click', function() {
                        document.querySelector('.nav-links').classList.toggle('active');
                    });
                    
                    // Form submission animation
                    document.querySelector('form').addEventListener('submit', function(e) {
                        const btn = document.querySelector('.submit-btn');
                        btn.disabled = true;
                        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                    });
                    
                    // Animate elements when they come into view
                    const animateOnScroll = () => {
                        const elements = document.querySelectorAll('.checkout-form, .order-summary');
                        
                        elements.forEach(element => {
                            const elementPosition = element.getBoundingClientRect().top;
                            const screenPosition = window.innerHeight / 1.2;
                            
                            if (elementPosition < screenPosition) {
                                element.style.animation = 'fadeIn 0.5s ease forwards';
                            }
                        });
                    };
                    
                    window.addEventListener('scroll', animateOnScroll);
                    animateOnScroll(); // Run once on page load
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading product details');
    }
});

// Complete Order - Updated to handle custom images
app.post('/complete-order', async (req, res) => {
    try {
        const { productId, productName, mrp, sizes, phone, street, area, pincode, district, state, utrNumber,
                customizationType, selectedDesign, customImage, customDescription, customizationCost } = req.body;
        
        const parsedSizes = JSON.parse(sizes);
        const total = parsedSizes.reduce((sum, size) => sum + (size.price * size.quantity), 0) + 
                      parseFloat(customizationCost || 0);
        
        const order = new Order({
            productId,
            productName,
            mrp: parseFloat(mrp),
            sizes: parsedSizes.map(size => ({
                size: size.size,
                price: size.price,
                quantity: size.quantity
            })),
            customization: customizationType ? {
                type: customizationType,
                customImage: customImage || null,
                customDescription: customDescription || null,
                selectedDesign: selectedDesign || null,
                additionalCost: parseFloat(customizationCost || 0)
            } : null,
            payment: {
                method: 'QR_CODE',
                qrCode: '/payment-qr.jpg',
                utrNumber,
                status: 'Pending'
            },
            phone,
            street,
            area,
            pincode,
            district,
            state,
            status: 'Pending'
        });
        
        await order.save();
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Confirmation | MyShop</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                <style>
  :root {
    --primary: #D4AF37; /* Gold */
    --primary-dark: #B38B2D;
    --secondary: #F5F5F5; /* Light gray */
    --dark: #121212; /* Almost black */
    --light: #FFFFFF; /* Pure white */
    --gray: #E0E0E0; /* Light gray */
    --gray-dark: #616161; /* Dark gray */
    --success: #28a745;
    --shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    --transition: all 0.3s ease;
    --border: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Poppins', sans-serif;
    background-color: var(--secondary);
    color: var(--dark);
    line-height: 1.6;
  }
  
  /* Header Styles */
  header {
    background-color: var(--light);
    box-shadow: var(--shadow);
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid var(--gray);
  }
  
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 5%;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .logo {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--dark);
    text-decoration: none;
    display: flex;
    align-items: center;
  }
  
  .logo i {
    margin-right: 0.5rem;
    color: var(--primary);
  }
  
  .nav-links {
    display: flex;
    gap: 1.5rem;
  }
  
  .nav-links a {
    color: var(--dark);
    text-decoration: none;
    font-weight: 500;
    transition: var(--transition);
    position: relative;
  }
  
  .nav-links a:hover {
    color: var(--primary);
  }
  
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: var(--primary);
    transition: var(--transition);
  }
  
  .nav-links a:hover::after {
    width: 100%;
  }
  
  .auth-links a {
    padding: 0.5rem 1rem;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 500;
    transition: var(--transition);
  }
  
  .auth-links .login {
    color: var(--primary);
    border: 1px solid var(--primary);
  }
  
  .auth-links .login:hover {
    background-color: var(--primary);
    color: var(--dark);
  }
  
  /* Mobile Menu */
  .menu-toggle {
    display: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: var(--dark);
  }
  
  /* Confirmation Section */
  .confirmation-container {
    max-width: 1200px;
    margin: 3rem auto;
    padding: 0 5%;
    animation: fadeIn 0.8s ease forwards;
  }
  
  .confirmation-card {
    background-color: var(--light);
    border-radius: 15px;
    padding: 3rem;
    box-shadow: var(--shadow);
    text-align: center;
    position: relative;
    overflow: hidden;
    border: var(--border);
  }
  
  .confirmation-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, var(--primary), #E6C875);
  }
  
  .success-icon {
    font-size: 5rem;
    color: var(--primary);
    margin-bottom: 1.5rem;
    animation: bounce 1s ease;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--dark);
    font-weight: 700;
  }
  
  .confirmation-text {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    color: var(--gray-dark);
  }
  
  .order-id {
    display: inline-block;
    background-color: var(--secondary);
    padding: 0.5rem 1.5rem;
    border-radius: 50px;
    font-weight: 600;
    margin-bottom: 2rem;
    color: var(--dark);
    border: 1px solid var(--primary);
  }
  
  .order-details {
    max-width: 600px;
    margin: 0 auto 3rem;
    text-align: left;
    background-color: var(--secondary);
    padding: 2rem;
    border-radius: 10px;
    border: var(--border);
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.8rem 0;
    border-bottom: 1px dashed var(--gray);
  }
  
  .detail-row:last-child {
    border-bottom: none;
  }
  
  .detail-label {
    font-weight: 500;
    color: var(--gray-dark);
  }
  
  .detail-value {
    font-weight: 600;
    color: var(--dark);
  }
  
  .product-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 5px;
    margin-right: 1rem;
    border: var(--border);
  }
  
  .custom-image-preview {
    max-width: 100px;
    margin-top: 0.5rem;
    border-radius: 5px;
    border: var(--border);
  }
  
  .continue-btn {
    display: inline-block;
    background-color: var(--dark);
    color: var(--primary);
    padding: 1rem 2.5rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    transition: var(--transition);
    margin-top: 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--dark);
  }
  
  .continue-btn:hover {
    background-color: var(--primary);
    color: var(--dark);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
  }
  
  /* Footer Styles */
  footer {
    background-color: var(--dark);
    color: var(--light);
    padding: 3rem 5%;
    margin-top: 3rem;
  }
  
  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
  }
  
  .footer-column h3 {
    color: var(--light);
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    position: relative;
  }
  
  .footer-column h3::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 2px;
    background-color: var(--primary);
  }
  
  .footer-column ul {
    list-style: none;
  }
  
  .footer-column ul li {
    margin-bottom: 0.8rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .footer-column ul li i {
    color: var(--primary);
    width: 20px;
    text-align: center;
  }
  
  .footer-column ul li a {
    color: var(--gray);
    text-decoration: none;
    transition: var(--transition);
  }
  
  .footer-column ul li a:hover {
    color: var(--primary);
    padding-left: 5px;
  }
  
  .social-links {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .social-links a {
    color: var(--dark);
    background-color: var(--primary);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
  }
  
  .social-links a:hover {
    background-color: var(--light);
    transform: translateY(-3px);
  }
  
  .copyright {
    text-align: center;
    padding-top: 2rem;
    margin-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--gray);
    font-size: 0.9rem;
  }
  
  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-30px); }
    60% { transform: translateY(-15px); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  /* Responsive Styles */
  @media (max-width: 768px) {
    .navbar {
      padding: 1rem;
    }
    
    .nav-links {
      position: fixed;
      top: 70px;
      left: -100%;
      width: 80%;
      height: calc(100vh - 70px);
      background-color: var(--light);
      flex-direction: column;
      align-items: center;
      padding: 2rem 0;
      transition: var(--transition);
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }
    
    .nav-links.active {
      left: 0;
    }
    
    .menu-toggle {
      display: block;
    }
    
    .auth-links {
      display: none;
    }
    
    .confirmation-card {
      padding: 2rem 1.5rem;
    }
    
    h1 {
      font-size: 2rem;
    }
    
    .order-details {
      padding: 1.5rem;
    }
  }
  
  @media (max-width: 576px) {
    .confirmation-container {
      margin: 2rem auto;
    }
    
    .success-icon {
      font-size: 4rem;
    }
    
    h1 {
      font-size: 1.8rem;
    }
    
    .detail-row {
      flex-direction: column;
    }
    
    .detail-label {
      margin-bottom: 0.3rem;
    }
    
    .continue-btn {
      padding: 0.8rem 1.5rem;
      font-size: 0.9rem;
    }
  }
</style>
            </head>
            <body>
                <header>
                    <nav class="navbar">
                        <a href="/" class="logo">
                            <i class="fas fa-store"></i> FESTIVE SPIDER 
                        </a>
                        
                        <div class="nav-links">
                            <a href="/">Home</a>
                            <a href="/about">About Us</a>
                            <a href="/contact">Contact Us</a>
                        </div>
                        
                        <div class="auth-links">
                            <a href="/login" class="login">Login</a>
                        </div>
                        
                        <div class="menu-toggle">
                            <i class="fas fa-bars"></i>
                        </div>
                    </nav>
                </header>
                
                <div class="confirmation-container">
                    <div class="confirmation-card">
                        <div class="success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h1>Thank You for Your Order!</h1>
                        <p class="confirmation-text">Your order has been placed successfully. We'll notify you once it's shipped.</p>
                        
                        <div class="order-id">Order ID: ${order._id}</div>
                        
                        <div class="order-details">
                            <div class="detail-row">
                                <span class="detail-label">Product:</span>
                                <span class="detail-value">${productName}</span>
                            </div>
                            
                            ${parsedSizes.map(size => `
                                <div class="detail-row">
                                    <span class="detail-label">Size ${size.size} (Qty: ${size.quantity}):</span>
                                    <span class="detail-value">₹${size.price * size.quantity}</span>
                                </div>
                            `).join('')}
                            
                            ${customizationType ? `
                                <div class="detail-row">
                                    <span class="detail-label">Customization:</span>
                                    <span class="detail-value">${customizationType}</span>
                                </div>
                                ${selectedDesign ? `
                                    <div class="detail-row">
                                        <span class="detail-label">Selected Design:</span>
                                        <span class="detail-value">${selectedDesign}</span>
                                    </div>
                                ` : ''}
                                ${customDescription ? `
                                    <div class="detail-row">
                                        <span class="detail-label">Instructions:</span>
                                        <span class="detail-value">${customDescription}</span>
                                    </div>
                                ` : ''}
                                ${customImage ? `
                                    <div class="detail-row">
                                        <span class="detail-label">Custom Image:</span>
                                        <span class="detail-value">
                                            <img src="${customImage}" class="custom-image-preview">
                                        </span>
                                    </div>
                                ` : ''}
                                <div class="detail-row">
                                    <span class="detail-label">Customization Cost:</span>
                                    <span class="detail-value">₹${customizationCost}</span>
                                </div>
                            ` : ''}
                            
                            <div class="detail-row">
                                <span class="detail-label">UTR Number:</span>
                                <span class="detail-value">${utrNumber}</span>
                            </div>
                            
                            <div class="detail-row" style="border-top: 2px solid var(--primary); padding-top: 1rem; margin-top: 1rem;">
                                <span class="detail-label" style="font-size: 1.1rem;">Total Amount:</span>
                                <span class="detail-value" style="font-size: 1.1rem; color: var(--primary);">₹${total+ 100}</span>
                            </div>
                        </div>
                        
                        <a href="/" class="continue-btn">
                            <i class="fas fa-shopping-bag"></i> Continue Shopping
                        </a>
                    </div>
                </div>
                
                <footer>
                    <div class="footer-content">
                        <div class="footer-column">
                            <h3>FESTIVE SPIDER </h3>
                            <p>Quality products with custom designs to match your unique style.</p>
                            <div class="social-links">
                                <a href="#"><i class="fab fa-facebook-f"></i></a>
                                <a href="#"><i class="fab fa-instagram"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                            </div>
                        </div>
                        <div class="footer-column">
                            <h3>Quick Links</h3>
                            <ul>
                                <li><a href="/">Home</a></li>
                                <li><a href="/about">About Us</a></li>
                                <li><a href="/contact">Contact Us</a></li>
                                <li><a href="#">Privacy Policy</a></li>
                            </ul>
                        </div>
                        <div class="footer-column">
                            <h3>Customer Service</h3>
                            <ul>
                                <li><a href="#">FAQs</a></li>
                                <li><a href="#">Shipping Policy</a></li>
                                <li><a href="#">Returns & Exchanges</a></li>
                                <li><a href="#">Size Guide</a></li>
                            </ul>
                        </div>
                        <div class="footer-column">
                            <h3>Contact Us</h3>
                            <ul>
                                <li><i class="fas fa-map-marker-alt"></i> 29a , rose garden , south ukkadam 641001</li>
                                <li><i class="fas fa-phone"></i> +91 9150448066</li>
                                <li><i class="fas fa-envelope"></i> spiderfestive@gmail.com</li>
                            </ul>
                        </div>
                    </div>
                    <div class="copyright">
                        &copy; ${new Date().getFullYear()} FESTIVE SPIDER . All rights reserved.
                    </div>
                </footer>
                
                <script>
                    // Mobile menu toggle
                    document.querySelector('.menu-toggle').addEventListener('click', function() {
                        document.querySelector('.nav-links').classList.toggle('active');
                    });
                    
                    // Confetti effect
                    function showConfetti() {
                        const confettiSettings = {
                            target: 'confetti-canvas',
                            max: 150,
                            size: 1.5,
                            animate: true,
                            props: ['circle', 'square', 'triangle', 'line'],
                            colors: [[108, 99, 255], [92, 225, 230], [255, 99, 97], [255, 206, 99]],
                            clock: 25,
                            rotate: true,
                            start_from_edge: true,
                            respawn: true
                        };
                        
                        const confetti = new ConfettiGenerator(confettiSettings);
                        confetti.render();
                        
                        setTimeout(() => {
                            confetti.clear();
                        }, 5000);
                    }
                    
                    // Load confetti script and run
                    const confettiScript = document.createElement('script');
                    confettiScript.src = 'https://cdn.jsdelivr.net/gh/mathusummut/confetti.js/confetti.min.js';
                    confettiScript.onload = showConfetti;
                    document.body.appendChild(confettiScript);
                    
                    // Create canvas for confetti
                    const canvas = document.createElement('canvas');
                    canvas.id = 'confetti-canvas';
                    canvas.style.position = 'fixed';
                    canvas.style.top = '0';
                    canvas.style.left = '0';
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.style.pointerEvents = 'none';
                    canvas.style.zIndex = '999';
                    document.body.appendChild(canvas);
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error completing order');
    }
});
// Admin Orders Page - Updated to show custom designs
app.get('/admin/orders', async (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    const orders = await Order.find().sort({ orderedAt: -1 }).populate('productId');
    
    let ordersHTML = '';
    for (const [index, order] of orders.entries()) {
        const product = await Product.findById(order.productId);
        const productImage = product ? product.mainImage.data : '';
        const totalAmount = order.sizes.reduce((sum, size) => sum + (size.price * size.quantity), 0) + (order.customization?.additionalCost || 0);
        
        ordersHTML += `
            <div class="card mb-4 shadow-sm order-card animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Order #${order._id}</h5>
                    <span class="badge bg-${getStatusColor(order.status)}">${order.status}</span>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3 mb-3 mb-md-0">
                            ${productImage ? `<img src="${productImage}" class="img-fluid rounded product-image" alt="${order.productName}">` : ''}
                        </div>
                        <div class="col-md-9">
                            <div class="row">
                                <div class="col-md-6">
                                    <h4>${order.productName}</h4>
                                    ${order.sizes.map(size => `
                                        <div class="size-item mb-2 p-2 bg-light rounded">
                                            <p class="mb-1"><strong>Size:</strong> ${size.size}</p>
                                            <p class="mb-1"><strong>Qty:</strong> ${size.quantity}</p>
                                            <p class="mb-0"><strong>Price:</strong> ₹${size.price * size.quantity}</p>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="col-md-6">
                                    ${order.customization ? `
                                        <div class="customization-section mb-3 p-3 bg-light rounded">
                                            <h5>Customization Details</h5>
                                            <p><strong>Type:</strong> ${order.customization.type}</p>
                                            ${order.customization.selectedDesign ? `
                                                <div class="mb-2">
                                                    <p class="mb-1"><strong>Selected Design:</strong> ${order.customization.selectedDesign}</p>
                                                    <img src="/customize/${order.customization.selectedDesign}" class="img-thumbnail" width="100">
                                                </div>
                                            ` : ''}
                                            ${order.customization.customDescription ? `<p><strong>Instructions:</strong> ${order.customization.customDescription}</p>` : ''}
                                            ${order.customization.customImage ? `
                                                <div class="mb-2">
                                                    <p class="mb-1"><strong>Custom Image:</strong></p>
                                                    <img src="${order.customization.customImage}" class="img-thumbnail" width="100">
                                                </div>
                                            ` : ''}
                                            <p><strong>Customization Cost:</strong> ₹${order.customization.additionalCost}</p>
                                        </div>
                                    ` : '<p class="text-muted">No customization</p>'}
                                </div>
                            </div>
                            
                            <div class="payment-section mt-3 p-3 bg-light rounded">
                                <h5>Payment Information</h5>
                                <div class="row">
                                    <div class="col-md-6">
                                        <p><strong>Method:</strong> QR Code</p>
                                        <p><strong>UTR Number:</strong> ${order.payment.utrNumber}</p>
                                    </div>
                                    <div class="col-md-6 text-md-end">
                                        <p><strong>Delivery Charge Rs100</strong></p>
                                        <h4 class="text-primary">Total: ₹${totalAmount + 100}</h4>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="customer-info mt-3 p-3 bg-light rounded">
                                <h5>Customer & Shipping</h5>
                                <p><strong>Phone:</strong> ${order.phone}</p>
                                <p><strong>Name & Address:</strong> ${order.street}, ${order.area}, ${order.district}, ${order.state} - ${order.pincode}</p>
                                <p class="text-muted"><small>Ordered At: ${new Date(order.orderedAt).toLocaleString()}</small></p>
                            </div>
                            
                            <div class="actions mt-3 d-flex justify-content-between">
                                <button class="btn btn-outline-primary btn-sm" onclick="updateStatus('${order._id}', 'processing')">
                                    <i class="fas fa-cog"></i> Processing
                                </button>
                                <button class="btn btn-outline-success btn-sm" onclick="updateStatus('${order._id}', 'shipped')">
                                    <i class="fas fa-truck"></i> Shipped
                                </button>
                                <button class="btn btn-outline-danger btn-sm" onclick="updateStatus('${order._id}', 'cancelled')">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                                <button class="btn btn-outline-secondary btn-sm" onclick="printOrder('${order._id}')">
                                    <i class="fas fa-print"></i> Print
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Orders | MyShop</title>
            
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            
            <!-- Font Awesome -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            
            <!-- Animate.css -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            
            <style>
                body {
                    background-color: #f8f9fa;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                .navbar-brand {
                    font-weight: 700;
                }
                
                .order-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    border: none;
                    border-radius: 10px;
                    overflow: hidden;
                }
                
                .order-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }
                
                .product-image {
                    max-height: 200px;
                    object-fit: contain;
                    transition: transform 0.3s ease;
                }
                
                .product-image:hover {
                    transform: scale(1.05);
                }
                
                .size-item {
                    transition: background-color 0.3s ease;
                }
                
                .size-item:hover {
                    background-color: #e9ecef !important;
                }
                
                .customization-section, .payment-section, .customer-info {
                    transition: background-color 0.3s ease;
                }
                
                .customization-section:hover, .payment-section:hover, .customer-info:hover {
                    background-color: #e9ecef !important;
                }
                
                @media (max-width: 768px) {
                    .actions {
                        flex-direction: column;
                        gap: 5px;
                    }
                    
                    .actions button {
                        width: 100%;
                    }
                    
                    .order-card {
                        margin-bottom: 20px;
                    }
                }
                
                /* Print-specific styles */
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-section, .print-section * {
                        visibility: visible;
                    }
                    .print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Navbar -->
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
                <div class="container">
                    <a class="navbar-brand" href="/admin">MyShop Admin</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/admin">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" href="/admin/orders">Orders</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/admin/add-product">Add Product</a>
                            </li>
                        </ul>
                        <div class="d-flex">
                            <a href="/logout" class="btn btn-outline-light">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
            
            <!-- Main Content -->
            <div class="container mb-5">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="mb-0">
                        <i class="fas fa-clipboard-list me-2"></i>Orders Management
                    </h2>
                    <div class="d-flex">
                        <input type="text" id="searchOrders" class="form-control me-2" placeholder="Search orders...">
                        <button class="btn btn-outline-secondary" id="refreshBtn">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                
                ${orders.length > 0 ? ordersHTML : `
                    <div class="text-center py-5">
                        <i class="fas fa-box-open fa-4x text-muted mb-3"></i>
                        <h3 class="text-muted">No orders found</h3>
                        <p class="text-muted">When customers place orders, they'll appear here.</p>
                    </div>
                `}
            </div>
            
            <!-- Print Modal -->
            <div class="modal fade" id="printModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Print Order</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="printModalContent">
                            <!-- Content will be loaded here -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="window.print()">
                                <i class="fas fa-print"></i> Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Bootstrap JS Bundle with Popper -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            
            <script>
                function getStatusColor(status) {
                    switch(status.toLowerCase()) {
                        case 'pending': return 'warning';
                        case 'processing': return 'info';
                        case 'shipped': return 'primary';
                        case 'delivered': return 'success';
                        case 'cancelled': return 'danger';
                        default: return 'secondary';
                    }
                }
                
                async function updateStatus(orderId, status) {
                    try {
                        const response = await fetch('/admin/update-order-status', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ orderId, status })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            alert('Order status updated successfully!');
                            location.reload();
                        } else {
                            alert('Error: ' + result.message);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('An error occurred while updating the order status.');
                    }
                }
                
                function printOrder(orderId) {
                    const orderElement = document.querySelector(\`.order-card:has(#order-\${orderId})\`) || 
                                       document.querySelector(\`[onclick*="'\${orderId}'"]\`)?.closest('.order-card');
                    
                    if (orderElement) {
                        const printContent = orderElement.innerHTML;
                        document.getElementById('printModalContent').innerHTML = \`
                            <div class="print-section p-4">
                                <div class="text-center mb-4">
                                    <h2>MyShop</h2>
                                    <p class="mb-0">Order Receipt</p>
                                    <hr>
                                </div>
                                \${printContent}
                                <div class="mt-4 pt-4 border-top text-center">
                                    <p class="mb-0 text-muted">Thank you for your order!</p>
                                    <p class="text-muted">Contact: support@myshop.com</p>
                                </div>
                            </div>
                        \`;
                        
                        const printModal = new bootstrap.Modal(document.getElementById('printModal'));
                        printModal.show();
                    }
                }
                
                // Search functionality
                document.getElementById('searchOrders').addEventListener('input', function(e) {
                    const searchTerm = e.target.value.toLowerCase();
                    const orderCards = document.querySelectorAll('.order-card');
                    
                    orderCards.forEach(card => {
                        const cardText = card.textContent.toLowerCase();
                        if (cardText.includes(searchTerm)) {
                            card.style.display = '';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
                
                // Refresh button
                document.getElementById('refreshBtn').addEventListener('click', function() {
                    location.reload();
                });
            </script>
        </body>
        </html>
    `);
});

// Helper function for status colors
function getStatusColor(status) {
    switch(status.toLowerCase()) {
        case 'pending': return 'warning';
        case 'processing': return 'info';
        case 'shipped': return 'primary';
        case 'delivered': return 'success';
        case 'cancelled': return 'danger';
        default: return 'secondary';
    }
}

// Add Product Page
app.get('/admin/add-product', (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    res.send(`
        <html>
        <head>
            <title>Add Product</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                body {
                    background-color: #f5f5f5;
                    color: #333;
                    line-height: 1.6;
                }
                
                header {
                    background-color: #2c3e50;
                    color: white;
                    padding: 1rem 0;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                
                header > div {
                    width: 90%;
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                header h1 {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                }
                
                header a {
                    color: white;
                    text-decoration: none;
                    margin-right: 1rem;
                    padding: 0.5rem;
                    border-radius: 4px;
                    transition: background-color 0.3s;
                }
                
                header a:hover {
                    background-color: #34495e;
                }
                
                .container {
                    width: 90%;
                    max-width: 1200px;
                    margin: 2rem auto;
                    background-color: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                
                h2 {
                    margin-bottom: 1.5rem;
                    color: #2c3e50;
                    border-bottom: 2px solid #eee;
                    padding-bottom: 0.5rem;
                }
                
                h3 {
                    margin: 1.5rem 0 1rem;
                    color: #3498db;
                }
                
                .form-group {
                    margin-bottom: 1.5rem;
                }
                
                label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #555;
                }
                
                input[type="text"],
                input[type="number"],
                textarea,
                select {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 1rem;
                    transition: border-color 0.3s;
                }
                
                input[type="text"]:focus,
                input[type="number"]:focus,
                textarea:focus,
                select:focus {
                    border-color: #3498db;
                    outline: none;
                }
                
                textarea {
                    min-height: 100px;
                    resize: vertical;
                }
                
                input[type="file"] {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px dashed #ddd;
                    border-radius: 4px;
                }
                
                button {
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 600;
                    transition: background-color 0.3s;
                }
                
                button:hover {
                    background-color: #2980b9;
                }
                
                #sizePricesContainer {
                    background-color: #f9f9f9;
                    padding: 1.5rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                }
                
                #sizePricesContainer > div {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                
                #sizePricesContainer select,
                #sizePricesContainer input[type="number"] {
                    flex: 1;
                }
                
                #sizePricesContainer button {
                    padding: 0.5rem 1rem;
                }
                
                #sizePricesList > div {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem;
                    background-color: white;
                    border: 1px solid #eee;
                    border-radius: 4px;
                    margin-bottom: 0.5rem;
                }
                
                #sizePricesList button {
                    padding: 0.25rem 0.5rem;
                    background-color: #e74c3c;
                }
                
                #sizePricesList button:hover {
                    background-color: #c0392b;
                }
                
                .nav-links {
                    display: flex;
                    gap: 1rem;
                }
                
                .user-actions {
                    display: flex;
                    gap: 1rem;
                }
                
                @media (max-width: 768px) {
                    header > div {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .nav-links, .user-actions {
                        margin-top: 1rem;
                        justify-content: center;
                    }
                    
                    #sizePricesContainer > div {
                        flex-direction: column;
                        align-items: stretch;
                    }
                }
            </style>
        </head>
        <body>
            <header>
                <div>
                    <div class="nav-links">
                        <h1>MyShop Admin</h1>
                        <a href="/admin">Home</a>
                        <a href="/admin/orders">Orders</a>
                        <a href="/admin/add-product">Add Product</a>
                    </div>
                    <div class="user-actions">
                        <a href="/logout">Logout</a>
                    </div>
                </div>
            </header>
            
            <div class="container">
                <h2>Add New Product</h2>
                <form id="productForm">
                    <div class="form-group">
                        <label>Product Name:</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Category:</label>
                        <input type="text" name="category" required>
                    </div>
                    <div class="form-group">
                        <label>Description:</label>
                        <textarea name="description" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Offer Percentage:</label>
                        <input type="number" name="offerPercentage" required>
                    </div>
                    <div class="form-group">
                        <label>MRP:</label>
                        <input type="number" name="mrp" required>
                    </div>
                    
                    <div id="sizePricesContainer">
                        <h3>Size Prices</h3>
                        <div>
                            <label>Size:</label>
                            <select id="sizeSelect">
                                <option value="1-2">1-2</option>
                                <option value="3-4">3-4</option>
                                <option value="5-6">5-6</option>
                                <option value="7-8">7-8</option>
                                <option value="9-10">9-10</option>
                                <option value="11-12">11-12</option>
                                <option value="13-14">13-14</option>
<option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                                <option value="XXL">XXL</option>
                                <option value="3XL">3XL</option>
                                <option value="4XL">4XL</option>
                                <option value="5XL">5XL</option>
                                <option value="6XL">6XL</option>
                                <option value="7XL">7XL</option>
                                <option value="8XL">8XL</option>
                            </select>
                            <label>Price:</label>
                            <input type="number" id="sizePriceInput">
                            <button type="button" onclick="addSizePrice()">Add Size Price</button>
                        </div>
                        <div id="sizePricesList"></div>
                    </div>
                    
                    <div class="form-group">
                        <label>Main Image:</label>
                        <input type="file" id="mainImage" accept="image/*" required>
                    </div>
                    <div class="form-group">
                        <label>Additional Images (multiple):</label>
                        <input type="file" id="additionalImages" multiple accept="image/*">
                    </div>
                    <button type="button" onclick="addProduct()">Add Product</button>
                </form>
            </div>
            
            <script>
                const sizePrices = [];
                
                function addSizePrice() {
                    const sizeSelect = document.getElementById('sizeSelect');
                    const priceInput = document.getElementById('sizePriceInput');
                    
                    const size = sizeSelect.value;
                    const price = parseFloat(priceInput.value);
                    
                    if (!size || isNaN(price)) {
                        alert('Please select a size and enter a valid price');
                        return;
                    }
                    
                    // Check if size already exists
                    if (sizePrices.some(sp => sp.size === size)) {
                        alert('Price for this size already added');
                        return;
                    }
                    
                    sizePrices.push({ size, price });
                    updateSizePricesList();
                    priceInput.value = '';
                }
                
                function updateSizePricesList() {
                    const container = document.getElementById('sizePricesList');
                    container.innerHTML = '';
                    
                    sizePrices.forEach((sp, index) => {
                        const div = document.createElement('div');
                        div.innerHTML = \`
                            <span>\${sp.size}: ₹\${sp.price.toFixed(2)}</span>
                            <button type="button" onclick="removeSizePrice(\${index})">Remove</button>
                        \`;
                        container.appendChild(div);
                    });
                }
                
                function removeSizePrice(index) {
                    sizePrices.splice(index, 1);
                    updateSizePricesList();
                }
                
                function addProduct() {
                    const form = document.getElementById('productForm');
                    const formData = new FormData(form);
                    
                    // Validate at least one size price
                    if (sizePrices.length === 0) {
                        alert('Please add at least one size price');
                        return;
                    }
                    
                    // Get main image
                    const mainImageInput = document.getElementById('mainImage');
                    const mainImageFile = mainImageInput.files[0];
                    const mainImagePromise = new Promise((resolve) => {
                        if (mainImageFile) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                formData.set('mainImageData', e.target.result.split(',')[1]);
                                formData.set('mainImageType', mainImageFile.type);
                                resolve();
                            };
                            reader.readAsDataURL(mainImageFile);
                        } else {
                            resolve();
                        }
                    });
                    
                    // Get additional images
                    const additionalImagesInput = document.getElementById('additionalImages');
                    const additionalImagesFiles = additionalImagesInput.files;
                    const additionalImagesPromises = [];
                    
                    for (let i = 0; i < additionalImagesFiles.length; i++) {
                        additionalImagesPromises.push(new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                formData.append('additionalImagesData', e.target.result.split(',')[1]);
                                formData.append('additionalImagesType', additionalImagesFiles[i].type);
                                resolve();
                            };
                            reader.readAsDataURL(additionalImagesFiles[i]);
                        }));
                    }
                    
                    // Add size prices to form data
                    formData.set('sizePrices', JSON.stringify(sizePrices));
                    
                    // Wait for all images to be processed
                    Promise.all([mainImagePromise, ...additionalImagesPromises])
                        .then(() => {
                            fetch('/api/products', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(Object.fromEntries(formData))
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    alert('Product added successfully!');
                                    window.location.href = '/admin';
                                } else {
                                    alert('Error adding product: ' + data.message);
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                alert('Error adding product');
                            });
                        });
                }
            </script>
        </body>
        </html>
    `);
});
// Edit Product Page
app.get('/admin/edit-product/:id', async (req, res) => {
    if (req.cookies.adminLoggedIn !== 'true') {
        return res.redirect('/login');
    }
    
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        
        res.send(`
            <html>
            <head>
                <title>Edit Product</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    }
                    
                    body {
                        background-color: #f5f5f5;
                        color: #333;
                        line-height: 1.6;
                    }
                    
                    header {
                        background-color: #2c3e50;
                        color: white;
                        padding: 1rem 0;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }
                    
                    header > div {
                        width: 90%;
                        max-width: 1200px;
                        margin: 0 auto;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    header h1 {
                        font-size: 1.5rem;
                        margin-bottom: 0.5rem;
                    }
                    
                    header a {
                        color: white;
                        text-decoration: none;
                        margin-right: 1rem;
                        padding: 0.5rem;
                        border-radius: 4px;
                        transition: background-color 0.3s;
                    }
                    
                    header a:hover {
                        background-color: #34495e;
                    }
                    
                    .container {
                        width: 90%;
                        max-width: 1200px;
                        margin: 2rem auto;
                        background-color: white;
                        padding: 2rem;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    
                    h2 {
                        margin-bottom: 1.5rem;
                        color: #2c3e50;
                        border-bottom: 2px solid #eee;
                        padding-bottom: 0.5rem;
                    }
                    
                    h3 {
                        margin: 1.5rem 0 1rem;
                        color: #3498db;
                    }
                    
                    .form-group {
                        margin-bottom: 1.5rem;
                    }
                    
                    label {
                        display: block;
                        margin-bottom: 0.5rem;
                        font-weight: 600;
                        color: #555;
                    }
                    
                    input[type="text"],
                    input[type="number"],
                    textarea,
                    select {
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 1rem;
                        transition: border-color 0.3s;
                    }
                    
                    input[type="text"]:focus,
                    input[type="number"]:focus,
                    textarea:focus,
                    select:focus {
                        border-color: #3498db;
                        outline: none;
                    }
                    
                    textarea {
                        min-height: 100px;
                        resize: vertical;
                    }
                    
                    input[type="file"] {
                        width: 100%;
                        padding: 0.5rem;
                        border: 1px dashed #ddd;
                        border-radius: 4px;
                    }
                    
                    button {
                        background-color: #3498db;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 1rem;
                        font-weight: 600;
                        transition: background-color 0.3s;
                    }
                    
                    button:hover {
                        background-color: #2980b9;
                    }
                    
                    #sizePricesContainer {
                        background-color: #f9f9f9;
                        padding: 1.5rem;
                        border-radius: 8px;
                        margin-bottom: 1.5rem;
                    }
                    
                    #sizePricesContainer > div {
                        display: flex;
                        gap: 1rem;
                        align-items: center;
                        margin-bottom: 1rem;
                    }
                    
                    #sizePricesContainer select,
                    #sizePricesContainer input[type="number"] {
                        flex: 1;
                    }
                    
                    #sizePricesContainer button {
                        padding: 0.5rem 1rem;
                    }
                    
                    #sizePricesList > div {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0.75rem;
                        background-color: white;
                        border: 1px solid #eee;
                        border-radius: 4px;
                        margin-bottom: 0.5rem;
                    }
                    
                    #sizePricesList button {
                        padding: 0.25rem 0.5rem;
                        background-color: #e74c3c;
                    }
                    
                    #sizePricesList button:hover {
                        background-color: #c0392b;
                    }
                    
                    .image-preview {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 1rem;
                        margin: 1rem 0;
                    }
                    
                    .image-preview img {
                        max-width: 200px;
                        max-height: 200px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        object-fit: contain;
                    }
                    
                    .nav-links {
                        display: flex;
                        gap: 1rem;
                    }
                    
                    .user-actions {
                        display: flex;
                        gap: 1rem;
                    }
                    
                    @media (max-width: 768px) {
                        header > div {
                            flex-direction: column;
                            text-align: center;
                        }
                        
                        .nav-links, .user-actions {
                            margin-top: 1rem;
                            justify-content: center;
                        }
                        
                        #sizePricesContainer > div {
                            flex-direction: column;
                            align-items: stretch;
                        }
                    }
                </style>
            </head>
            <body>
                <header>
                    <div>
                        <div class="nav-links">
                            <h1>MyShop Admin</h1>
                            <a href="/admin">Home</a>
                            <a href="/admin/orders">Orders</a>
                            <a href="/admin/add-product">Add Product</a>
                        </div>
                        <div class="user-actions">
                            <a href="/logout">Logout</a>
                        </div>
                    </div>
                </header>
                
                <div class="container">
                    <h2>Edit Product</h2>
                    <form id="productForm">
                        <div class="form-group">
                            <label>Product Name:</label>
                            <input type="text" name="name" value="${product.name}" required>
                        </div>
                        <div class="form-group">
                            <label>Category:</label>
                            <input type="text" name="category" value="${product.category}" required>
                        </div>
                        <div class="form-group">
                            <label>Description:</label>
                            <textarea name="description" required>${product.description}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Offer Percentage:</label>
                            <input type="number" name="offerPercentage" value="${product.offerPercentage}" required>
                        </div>
                        <div class="form-group">
                            <label>MRP:</label>
                            <input type="number" name="mrp" value="${product.mrp}" required>
                        </div>
                        
                        <div id="sizePricesContainer">
                            <h3>Size Prices</h3>
                            <div>
                                <label>Size:</label>
                                <select id="sizeSelect">
                                    <option value="1-2">1-2</option>
                                    <option value="3-4">3-4</option>
                                    <option value="5-6">5-6</option>
                                    <option value="7-8">7-8</option>
                                    <option value="9-10">9-10</option>
                                    <option value="11-12">11-12</option>
                                    <option value="13-14">13-14</option>
<option value="S">
S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                    <option value="3XL">3XL</option>
                                    <option value="4XL">4XL</option>
                                    <option value="5XL">5XL</option>
                                    <option value="6XL">6XL</option>
                                    <option value="7XL">7XL</option>
                                    <option value="8XL">8XL</option>
                                </select>
                                <label>Price:</label>
                                <input type="number" id="sizePriceInput">
                                <button type="button" onclick="addSizePrice()">Add Size Price</button>
                            </div>
                            <div id="sizePricesList">
                                ${product.sizePrices.map(sp => `
                                    <div>
                                        <span>${sp.size}: ₹${sp.price.toFixed(2)}</span>
                                        <button type="button" onclick="removeSizePrice('${sp.size}')">Remove</button>
                                        <input type="hidden" name="size_${sp.size}" value="${sp.size}">
                                        <input type="hidden" name="price_${sp.size}" value="${sp.price}">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Current Main Image:</label>
                            <div class="image-preview">
                                <img src="${product.mainImage.data}">
                            </div>
                            <label>Change Main Image:</label>
                            <input type="file" id="mainImage" accept="image/*">
                        </div>
                        <div class="form-group">
                            <label>Current Additional Images:</label>
                            <div class="image-preview">
                                ${product.additionalImages.map(img => `<img src="${img.data}">`).join('')}
                            </div>
                            <label>Change Additional Images (multiple):</label>
                            <input type="file" id="additionalImages" multiple accept="image/*">
                        </div>
                        <button type="button" onclick="updateProduct('${product._id}')">Update Product</button>
                    </form>
                </div>
                
                <script>
                    let sizePrices = ${JSON.stringify(product.sizePrices)};
                    
                    function addSizePrice() {
                        const sizeSelect = document.getElementById('sizeSelect');
                        const priceInput = document.getElementById('sizePriceInput');
                        
                        const size = sizeSelect.value;
                        const price = parseFloat(priceInput.value);
                        
                        if (!size || isNaN(price)) {
                            alert('Please select a size and enter a valid price');
                            return;
                        }
                        
                        // Check if size already exists
                        if (sizePrices.some(sp => sp.size === size)) {
                            alert('Price for this size already added');
                            return;
                        }
                        
                        sizePrices.push({ size, price });
                        updateSizePricesList();
                        priceInput.value = '';
                    }
                    
                    function updateSizePricesList() {
                        const container = document.getElementById('sizePricesList');
                        container.innerHTML = '';
                        
                        sizePrices.forEach((sp) => {
                            const div = document.createElement('div');
                            div.innerHTML = \`
                                <span>\${sp.size}: ₹\${sp.price.toFixed(2)}</span>
                                <button type="button" onclick="removeSizePrice('\${sp.size}')">Remove</button>
                                <input type="hidden" name="size_\${sp.size}" value="\${sp.size}">
                                <input type="hidden" name="price_\${sp.size}" value="\${sp.price}">
                            \`;
                            container.appendChild(div);
                        });
                    }
                    
                    function removeSizePrice(size) {
                        sizePrices = sizePrices.filter(sp => sp.size !== size);
                        updateSizePricesList();
                    }
                    
                    function updateProduct(id) {
                        const form = document.getElementById('productForm');
                        const formData = new FormData(form);
                        
                        // Validate at least one size price
                        if (sizePrices.length === 0) {
                            alert('Please add at least one size price');
                            return;
                        }
                        
                        // Get main image
                        const mainImageInput = document.getElementById('mainImage');
                        const mainImageFile = mainImageInput.files[0];
                        const mainImagePromise = new Promise((resolve) => {
                            if (mainImageFile) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    formData.set('mainImageData', e.target.result.split(',')[1]);
                                    formData.set('mainImageType', mainImageFile.type);
                                    resolve();
                                };
                                reader.readAsDataURL(mainImageFile);
                            } else {
                                resolve();
                            }
                        });
                        
                        // Get additional images
                        const additionalImagesInput = document.getElementById('additionalImages');
                        const additionalImagesFiles = additionalImagesInput.files;
                        const additionalImagesPromises = [];
                        
                        for (let i = 0; i < additionalImagesFiles.length; i++) {
                            additionalImagesPromises.push(new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    formData.append('additionalImagesData', e.target.result.split(',')[1]);
                                    formData.append('additionalImagesType', additionalImagesFiles[i].type);
                                    resolve();
                                };
                                reader.readAsDataURL(additionalImagesFiles[i]);
                            }));
                        }
                        
                        // Add size prices to form data
                        formData.set('sizePrices', JSON.stringify(sizePrices));
                        
                        // Wait for all images to be processed
                        Promise.all([mainImagePromise, ...additionalImagesPromises])
                            .then(() => {
                                fetch(\`/api/products/\${id}\`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(Object.fromEntries(formData))
                                })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        alert('Product updated successfully!');
                                        window.location.href = '/admin';
                                    } else {
                                        alert('Error updating product: ' + data.message);
                                    }
                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                    alert('Error updating product');
                                });
                            });
                    }
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading product');
    }
});

// View Product Page

// Checkout Page
// Checkout Page

// Complete Order


// Search Products
app.get('/search', async (req, res) => {
    const query = req.query.query;
    const products = await Product.find({ name: { $regex: query, $options: 'i' } });
    
    let productsHTML = '';
    products.forEach(product => {
        productsHTML += `
            <div onclick="window.location.href='/product/${product._id}'">
                <img src="${product.mainImage.data}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description.substring(0, 50)}...</p>
                <p>Price: ₹${product.price} <span>₹${product.mrp}</span> <span>${product.offerPercentage}% off</span></p>
            </div>
        `;
    });
    
    res.send(`
        <html>
        <head>
            <title>Search Results</title>
        </head>
        <body>
            <header>
                <div>
                    <div>
                        <h1>MyShop</h1>
                        <a href="/">Home</a>
                        <a href="/about">About Us</a>
                        <a href="/contact">Contact Us</a>
                    </div>
                    <div>
                        <a href="/login">Login</a>
                    </div>
                </div>
                <div>
                    <form action="/search" method="GET">
                        <input type="text" name="query" placeholder="Search products..." value="${query}">
                        <button type="submit">Search</button>
                    </form>
                </div>
            </header>
            
            <div>
                <h2>Search Results for "${query}"</h2>
                <div>
                    ${productsHTML}
                </div>
            </div>
        </body>
        </html>
    `);
});

// API Routes

// Get all products
// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add new product
app.post('/api/products', async (req, res) => {
    try {
        const { name, category, description, offerPercentage, mrp, sizePrices, 
                mainImageData, mainImageType, additionalImagesData = [], additionalImagesType = [] } = req.body;
        
        // Create main image object
        const mainImage = {
            data: `data:${mainImageType};base64,${mainImageData}`,
            contentType: mainImageType
        };
        
        // Create additional images array
        const additionalImages = [];
        if (Array.isArray(additionalImagesData)) {
            for (let i = 0; i < additionalImagesData.length; i++) {
                additionalImages.push({
                    data: `data:${additionalImagesType[i]};base64,${additionalImagesData[i]}`,
                    contentType: additionalImagesType[i]
                });
            }
        } else if (additionalImagesData) {
            // Handle case when only one additional image is provided
            additionalImages.push({
                data: `data:${additionalImagesType};base64,${additionalImagesData}`,
                contentType: additionalImagesType
            });
        }
        
        // Parse size prices
        const parsedSizePrices = JSON.parse(sizePrices);
        
        // Create product
        const product = new Product({
            name,
            category,
            description,
            offerPercentage: parseFloat(offerPercentage),
            mrp: parseFloat(mrp),
            sizePrices: parsedSizePrices,
            mainImage,
            additionalImages
        });
        
        await product.save();
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, category, description, offerPercentage, mrp, sizePrices, 
                mainImageData, mainImageType, additionalImagesData = [], additionalImagesType = [] } = req.body;
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        // Update fields
        product.name = name || product.name;
        product.category = category || product.category;
        product.description = description || product.description;
        product.offerPercentage = parseFloat(offerPercentage) || product.offerPercentage;
        product.mrp = parseFloat(mrp) || product.mrp;
        
        // Update size prices if provided
        if (sizePrices) {
            product.sizePrices = JSON.parse(sizePrices);
        }
        
        // Update main image if provided
        if (mainImageData && mainImageType) {
            product.mainImage = {
                data: `data:${mainImageType};base64,${mainImageData}`,
                contentType: mainImageType
            };
        }
        
        // Update additional images if provided
        if (additionalImagesData.length > 0) {
            product.additionalImages = [];
            if (Array.isArray(additionalImagesData)) {
                for (let i = 0; i < additionalImagesData.length; i++) {
                    product.additionalImages.push({
                        data: `data:${additionalImagesType[i]};base64,${additionalImagesData[i]}`,
                        contentType: additionalImagesType[i]
                    });
                }
            } else {
                product.additionalImages.push({
                    data: `data:${additionalImagesType};base64,${additionalImagesData}`,
                    contentType: additionalImagesType
                });
            }
        }
        
        await product.save();
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
