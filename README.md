# متجري - E-Commerce Website
**Mustafa Khalil Kullab | ID: 20232422**  
Web Application Development Course

---

## Project Overview
A complete full-stack e-commerce website with a customer-facing storefront 
and a full admin control panel. Built from scratch using PHP and MySQL with 
no external frameworks.

## Technologies
- **Backend:** PHP 8 with PDO (prepared statements throughout)
- **Database:** MySQL — 7 tables with foreign keys, indexes, and constraints
- **Frontend:** HTML5, CSS3 (1374 lines, fully responsive), JavaScript
- **Security:** password_hash, htmlspecialchars, session-based auth, 
  SQL injection prevention

## Database — 7 Tables
`users` · `categories` · `products` · `cart_items` · `orders` · 
`order_items` · `contacts`

## Customer Pages (8)
| Page | Description |
|------|-------------|
| index.php | Hero section, featured products, category browser |
| products.php | Full product grid with search, filter by category, sort by price |
| product_detail.php | Product info, quantity selector, related products |
| cart.php | Cart management, quantity update, item removal, order summary |
| checkout.php | Address form, order confirmation, stock update via transaction |
| contact.php | Contact form saved to database |
| login.php / register.php | Auth with hashed passwords |
| profile.php | Edit profile, change password, full order history |

## Admin Panel (5)
| Page | Description |
|------|-------------|
| admin_dashboard.php | Stats: orders, revenue, products, users, unread messages |
| admin_products.php | Add, edit, delete products with image upload |
| admin_orders.php | View all orders, update status, view order items |
| admin_users.php | Change user roles, delete users (blocked if user has orders) |
| admin_messages.php | View, mark as read, delete contact messages |

## Installation
1. Install XAMPP and start Apache + MySQL
2. Place project folder in `htdocs/` as `Mustafa_kullab`
3. Open phpMyAdmin → import `sql/ecommerce_db.sql`
4. Visit `http://localhost/Mustafa_kullab`

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | password |
| Customer | ahmed@example.com | password |

