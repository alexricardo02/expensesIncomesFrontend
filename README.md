# 💰 Finance Tracker — Frontend

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

A full-stack personal finance dashboard for tracking incomes and expenses. Built with Next.js, featuring JWT-based authentication, interactive charts, full transaction management, and a responsive mobile-first design.

🌍 **Live:** [expenses-incomes-frontend.vercel.app](https://expenses-incomes-frontend.vercel.app)  
🔗 **Backend API:** [finance-tracker-backend](https://github.com/alexricardo02/finance-tracker-backend)

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Pages & Routes](#-pages--routes)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)

---

## ✅ Features

- **JWT Authentication** — Login, register, and protected routes via Next.js middleware
- **Financial Dashboard** — Total balance, income, and expense summary cards with sparkline charts
- **Transaction Management** — Create, edit, delete, and filter transactions
- **Advanced Filtering** — Filter by type, category, date, and minimum amount
- **Interactive Charts** — Balance sparkline (Chart.js) and income vs expense pie chart
- **Statistics Page** — Visual breakdown of financial data
- **Responsive Design** — Mobile-first layout with separate views for desktop and mobile
- **Cookie-based session** — JWT stored in cookies with automatic logout on expiry

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Lucide React |
| HTTP | Native `fetch` API |
| Auth | JWT via `js-cookie` |
| Notifications | react-hot-toast |
| Deployment | Vercel |

---

## 📁 Project Structure

```
app/
├── components/
│   ├── BalanceChart.tsx        # Sparkline chart for dashboard
│   ├── TransactionList.tsx     # Mobile transaction list with accordion
│   ├── TransactionTable.tsx    # Desktop table with filters and CRUD
│   └── LogoutButton.tsx        # Client-side logout with cookie cleanup
├── login/
│   └── page.tsx                # Login page
├── register/
│   └── page.tsx                # Registration page
├── new-transaction/
│   └── page.tsx                # Create income or expense
├── edit-transactions/
│   └── page.tsx                # Full transaction management table
├── statistics/
│   ├── page.tsx                # Server component — fetches stats
│   └── StatisticsContent.tsx   # Client component — renders pie chart
├── layout.tsx                  # Root layout
├── page.tsx                    # Dashboard (Server Component)
└── globals.css
lib/
└── utils.ts                    # Currency formatting utility
middleware.ts                   # Route protection via JWT cookie check
```

---

## 🗺 Pages & Routes

| Route | Description | Auth Required |
|---|---|---|
| `/login` | User login | No |
| `/register` | User registration | No |
| `/` | Main dashboard | Yes |
| `/new-transaction` | Create income or expense | Yes |
| `/edit-transactions` | View, filter, edit, delete all transactions | Yes |
| `/statistics` | Income vs expense breakdown chart | Yes |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 20+
- A running instance of the [backend API](https://github.com/alexricardo02/finance-tracker-backend)

### 1. Clone the repository
```bash
git clone https://github.com/alexricardo02/expensesIncomesFrontend.git
cd expensesIncomesFrontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_API_URL_INCOMES=http://localhost:8080/api/incomes
NEXT_PUBLIC_API_URL_EXPENSES=http://localhost:8080/api/expenses
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the backend API |
| `NEXT_PUBLIC_API_URL_INCOMES` | Full URL for the incomes endpoint |
| `NEXT_PUBLIC_API_URL_EXPENSES` | Full URL for the expenses endpoint |

---

## 🔗 Related

- [Finance Tracker Backend](https://github.com/alexricardo02/finance-tracker-backend) — Spring Boot REST API

---

## 👤 Author

**Alex Brinckmann**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
