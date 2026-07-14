# Mustafa_Kullab - E-Commerce Website

A full-stack e-commerce web application built with PHP, MySQL, HTML5, CSS3, and JavaScript.

## 🛠️ Technologies Used
- **Backend:** PHP 8 (PDO)
- **Database:** MySQL
- **Frontend:** HTML5, CSS3, JavaScript
- **Icons:** Font Awesome 6

## 📁 Project Structure
Mustafa_kullab/
├── admin/          # Admin panel pages
├── assets/         # CSS, JS, Images
├── config/         # Database connection
├── includes/       # Header, navbar, footer
├── sql/            # Database schema
└── *.php           # Customer pages

## ⚙️ Installation
1. Install XAMPP
2. Copy project folder to `htdocs/Mustafa_kullab`
3. Import `sql/ecommerce_db.sql` into phpMyAdmin
4. Open `http://localhost/Mustafa_kullab`

## 🔑 Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | password |
| Customer | ahmed@example.com | password |

## 📄 Pages
**Customer:** Home, Products, Product Detail, Cart, Checkout, Contact, Login, Register, Profile

**Admin:** Dashboard, Products, Orders, Users, Messages

## 🔒 Security
- PDO Prepared Statements
- Password Hashing (password_hash)
- Session-based authentication
- XSS protection (htmlspecialchars)
