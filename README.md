# 📊 Daily Expense Tracker

> **Master Your Money, Secure Your Future.**  
> A sophisticated, full-stack financial management solution built for the modern individual. Track every penny, visualize spending patterns, and stay within your budget with intelligent, proactive alerts.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.18.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.42.0-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📖 Table of Contents
- [✨ Key Features](#-key-features)
- [💻 Tech Stack](#-tech-stack)
- [🏗️ System Architecture](#-system-architecture)
- [🚀 Getting Started](#-getting-started)
- [📖 Detailed Usage Guide](#-detailed-usage-guide)
- [🔐 Security & Data Integrity](#-security--data-integrity)
- [📂 Project Structure](#-project-structure)
- [🚧 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [👤 Author](#-author)

---

## ✨ Key Features

### 🧠 Intelligent Budgeting
- **Proactive Warnings**: Don't just track overspending—prevent it. The system calculates your potential balance *before* you save an expense and warns you if you're about to cross a limit.
- **Granular Limits**: Set daily, weekly, monthly, or yearly limits for specific categories (Food, Health, etc.) or your total spending.
- **Smart Detection**: automatically detects existing limits for easy editing and prevents duplication.

### 📊 Advanced Analytics
- **Dynamic Dashboard**: Real-time summary cards showing Today, This Week, This Month, and Annual totals.
- **Interactive Visualizations**: Beautiful, responsive charts (Doughnut & Line) powered by Chart.js for deep category and trend analysis.
- **Auto-Refresh**: Data stays fresh with intelligent polling (every 30 seconds) without manual reloads.

### 🎨 Premium UI/UX
- **Modern Design**: A sleek, dark-themed responsive interface built with Bootstrap 5.
- **Seamless Navigation**: Intuitive sidebar navigation and quick-action widgets.
- **Mobile Optimized**: Manage your finances on the go with a fully responsive mobile layout.

### 🔐 Enterprise-Grade Security
- **JWT Authentication**: Secure, stateless session management with 7-day tokens.
- **Bcrypt Hashing**: Industry-standard password encryption with 10 salt rounds.
- **Sanitized Queries**: Full protection against SQL injection using parameterized SQLite queries.

---

## 💻 Tech Stack

| Type | Technologies |
| :--- | :--- |
| **Frontend** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) ![Bootstrap 5](https://img.shields.io/badge/Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white) |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) |
| **Database** | ![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white) |
| **Security** | ![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=json-web-tokens&logoColor=white) ![Bcrypt](https://img.shields.io/badge/Bcrypt-4F4F4F?style=flat-square) |

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pankhi-Sarma/DAILY-EXPENSE-TRACKER.git
   cd DAILY-EXPENSE-TRACKER
   ```

2. **Initialize Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the `backend/` directory (optional for local dev):
   ```env
   JWT_SECRET=your_secure_random_string
   PORT=3000
   ```

4. **Launch Application**
   ```bash
   node server.js
   ```

5. **Access the App**
   Open your browser and navigate to:
   - `http://localhost:3000/login.html` (Full App Experience)
   - `http://localhost:3000/api` (REST API documentation base)

---

## 📖 Detailed Usage Guide

### 1. Account Setup
- Register with a valid email and secure password.
- Log in to initialize your local SQLite database (created automatically on first run).

### 2. Managing Expenses
- Click **"Add Expense"** from the sidebar.
- Enter the amount, date, and category.
- Add optional notes for better tracking.
- If a warning pops up, review your budget before confirming.

### 3. Setting Boundaries
- Use the **"Set Spending Limits"** feature to define your financial goals.
- You can edit existing limits by simply trying to set a new one for the same category/period—the system handles the rest.

---

## 📂 Project Structure

```text
Daily Expense Tracker/
├── backend/
│   ├── routes/          # API Endpoint handlers
│   ├── middleware/      # JWT Authorization
│   ├── db.js            # SQLite connection & Schema
│   └── server.js        # Express application entry
├── frontend/
│   ├── assets/          # JS, CSS, and Animations
│   ├── dashboard.html   # Main analytics view
│   ├── add-expense.html # Expense & Limit entry
│   └── login.html       # Landing page
├── database/            # Local SQLite storage
└── docs/                # Architecture and Guides
---

## 🚧 Roadmap
- [ ] **Data Export**: PDF and CSV reports for accounting.
- [ ] **Smart Categories**: AI-powered expense categorization.
- [ ] **Dark Mode**: High-contrast theme for night usage.
- [ ] **Cloud Sync**: Integration with PostgreSQL for distributed data.
- [ ] **Biometric Login**: Support for face/touch ID on mobile devices.

---

## 🤝 Contributing
Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👤 Author

**Pankhi Sarma**  
Full Stack Developer | Financial Tech Enthusiast  

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Pankhi-Sarma)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pankhi-sarma/)

---

Built with ❤️ for better financial management.  
*Last Updated: February 2026*
