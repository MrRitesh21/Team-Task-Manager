# 🚀 Team Task Manager (TaskSync)

A premium, full-stack collaborative task management application built with **React**, **Node.js**, **Express**, and **PostgreSQL (Prisma)**. 

## ✨ Key Features

-   **User Authentication**: Secure Signup/Login with JWT and Refresh Tokens.
-   **Project Management**: Create projects, manage team members, and assign roles (Admin/Member).
-   **Task Management**: Create, assign, track (Kanban Drag-and-Drop), and delete tasks.
-   **Rich Dashboard**: Real-time stats, workload distribution charts, and activity feeds.
-   **Role-Based Access (RBAC)**: Fine-grained permissions for project settings and task modifications.
-   **Premium UI**: Sleek dark-mode aesthetic with glassmorphism and smooth Framer Motion animations.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, TailwindCSS, Framer Motion, Lucide Icons, DnD Kit.
-   **Backend**: Node.js, Express, Prisma ORM.
-   **Database**: PostgreSQL (Railway).
-   **Authentication**: JWT (Access + Refresh Tokens) & HttpOnly Cookies.
-   **Deployment**: Vercel (Frontend) & Railway (Backend).

## 📦 Setup & Installation

### Prerequisites
-   Node.js (v18+)
-   PostgreSQL instance (or Railway account)

### 1. Clone the repository
```bash
git clone https://github.com/MrRitesh21/Team-Task-Manager.git
cd Team-Task-Manager
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=8080
CLIENT_URL=http://localhost:5173
```
Sync the database:
```bash
npx prisma db push
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:8080/api/
```

### 4. Run Locally
```bash
# In /server
npm run dev

# In /client
npm run dev
```

## 🌍 Deployment

### Railway (Backend)
1.  Connect your repo to Railway.
2.  Add a PostgreSQL plugin.
3.  Set the Environment Variables listed above.
4.  Railway will automatically use the `railway.toml` for deployment.

### Vercel (Frontend)
1.  Connect your repo to Vercel.
2.  Set `VITE_API_URL` to your Railway backend URL (including `/api/`).
3.  Deploy!

## ✅ Demo Account
-   **Email**: `admin@demo.com`
-   **Password**: `Admin@123`

---
Developed for the Full-Stack Coding Assignment.
