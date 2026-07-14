# Backend Documentation — Mustafa_Kullab E-Commerce

## Stack
- **Language:** PHP 8
- **Database:** MySQL
- **Connection:** PDO with prepared statements
- **Auth:** PHP Sessions + password_hash / password_verify

---

## Database — 7 Tables

| Table | Description |
|-------|-------------|
| users | Customers and admins (role ENUM) |
| categories | Product categories |
| products | Products with stock, price, image, category FK |
| cart_items | User cart (UNIQUE per user+product) |
| orders | Orders with status ENUM and shipping address |
| order_items | Order lines with unit_price snapshot |
| contacts | Contact form messages with is_read flag |

---

## Core PHP Files

| File | Responsibility |
|------|---------------|
| config/config.php | PDO connection, session start, constants |
| login.php | Verify credentials, set session, redirect by role |
| register.php | Validate input, hash password, insert user |
| logout.php | Destroy session |
| add_to_cart.php | Insert or update cart_items, validate stock |
| update_cart.php | Update quantity with stock check |
| remove_from_cart.php | Delete cart row (user-owned only) |
| checkout.php | Transaction: insert order + order_items + clear cart + update stock |
| contact_process.php | Validate and insert into contacts table |
| profile.php | Update user info and password |

---

## Admin Files

| File | Responsibility |
|------|---------------|
| admin_dashboard.php | Aggregate stats from all tables |
| admin_products.php | Full CRUD + image upload |
| admin_orders.php | List orders, update status |
| admin_users.php | Change role, delete (blocked if has orders) |
| admin_messages.php | View, mark read, delete messages |

---

## Security
- All queries use PDO prepared statements (no raw user input in SQL)
- Passwords stored with `password_hash(PASSWORD_DEFAULT)`
- Output escaped with `htmlspecialchars()` throughout
- Admin pages check `$_SESSION['role'] === 'admin'` at top of every file
- Cart and order operations verify `user_id` matches session before any write

---

## Checkout Flow (Transaction)
```php
$pdo->beginTransaction();
// 1. INSERT into orders
// 2. INSERT each item into order_items (with unit_price snapshot)
// 3. UPDATE products stock_quantity -= quantity
// 4. DELETE cart_items for this user
$pdo->commit();
// On failure: $pdo->rollBack();
```

---

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | password |
| Customer | ahmed@example.com | password |
