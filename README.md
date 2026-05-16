# Team Task Manager (TaskSync)

A production-ready, full-stack Team Task Manager web application. Clean, fast, and functional — inspired by Linear and Jira.

## 🚀 Features

- **Auth**: JWT-based authentication with access and refresh tokens.
- **Projects**: Create, update, and delete projects. Role-based access (ADMIN/MEMBER).
- **Kanban Board**: Drag-and-drop tasks between columns (TODO, IN_PROGRESS, IN_REVIEW, DONE).
- **Task Management**: Create tasks, assign members, set due dates, and track priority.
- **Task Details**: Slide-over panel with markdown description and real-time comments.
- **Dashboard**: Real-time stats, overdue task detection, and recent activity feed.
- **Settings**: Manage project members and permissions.
- **Profile**: Update personal info and change password.

## 🏗️ Tech Stack

- **Frontend**: React + Vite + TailwindCSS + dnd-kit + Framer Motion
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcryptjs + cookie-parser
- **Deployment**: Railway

## 🛠️ Local Setup

### Server
1. `cd server`
2. `npm install`
3. Create `.env` from `.env.example` and add your `DATABASE_URL`.
4. `npx prisma migrate dev`
5. `npm run seed` (Admin: admin@demo.com / Admin@123)
6. `npm run dev`

### Client
1. `cd client`
2. `npm install`
3. `npm run dev`

## 📦 Deployment (Railway)

1. Connect your GitHub repo to Railway.
2. Add a PostgreSQL database plugin.
3. Configure environment variables in Railway:
   - `DATABASE_URL` (automatically provided by Postgres plugin)
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CLIENT_URL`
   - `NODE_ENV=production`
4. Railway will use the `railway.toml` at the root to deploy both services.

## ✅ Demo Account
- **Email**: `admin@demo.com`
- **Password**: `Admin@123`
