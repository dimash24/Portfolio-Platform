Description
A Node.js-based platform for managing portfolios with features like authentication, role-based access control, and API integration.

Features
User Authentication: Register, log in with 2FA, and hashed passwords.
Role-Based Access:
Admin: Full portfolio management (add, edit, delete).
Editor: Add-only access.
Portfolio Management: Add items with title, description, and images.
API Integration: View financial data and news articles.
Email Notifications: Welcome email on registration.


Project Structure:

app.js              # Main server file
public/             # Static files (CSS, JS, uploads)
routes/             # Routes (auth, portfolio, API)
utils/              # Helper functions (auth, email)
models/             # Database models (User, Portfolio)
views/              # EJS templates (auth, portfolio, API, main)


Usage

Register/Login:
Register at /auth/register and set up 2FA.
Log in at /auth/login.
Portfolio Management:
Admin: Manage items at /portfolio/admin.
Editor: Limited permissions.
APIs:
View stock data at /api/stock.
View news articles at /api/news.

