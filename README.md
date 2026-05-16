# 🚀 TaskSync: Premium Team Task Manager

TaskSync is a state-of-the-art, full-stack collaborative platform designed to streamline team workflows with precision and style. Built for high-performance teams, it combines a sleek, glassmorphic aesthetic with robust project management and role-based access control.

## 🌟 Vision & Mission
Our mission was to build more than just a "task list." TaskSync is a centralized hub for teams to align, collaborate, and execute projects with total transparency. From real-time Kanban updates to detailed activity feeds, every feature is designed to eliminate friction.

---

## ✨ Core Features

### 🔐 Advanced Authentication
- **Secure Sessions**: JWT-based authentication with Access and Refresh token rotation.
- **Persistent Login**: HttpOnly cookies to protect against XSS and CSRF attacks.
- **Onboarding**: Instant account creation with personalized team member profiles.

### 📁 Project & Team Management
- **Creator Dominance**: Project creators are automatically assigned the **ADMIN** role.
- **Dynamic Invitations**: Invite collaborators via email with specific role assignments.
- **RBAC (Role-Based Access Control)**: 
  - **Admins**: Can delete projects, change roles, remove members, and modify all tasks.
  - **Members**: Can create tasks, comment, and update statuses of assigned work.
- **Quick Join**: Unique, copyable invite codes for instant team expansion.

### 📋 Task Orchestration
- **Kanban Board**: A fluid, drag-and-drop interface powered by `@dnd-kit`.
- **Detailed Insights**: Priority levels (Urgent to Low), due dates, and rich-text descriptions.
- **Collaboration**: Nested comment system for task-specific discussions and updates.
- **Assignment**: Assign tasks to specific members to ensure accountability.

### 📊 Intelligence Dashboard
- **Real-time Metrics**: Instant overview of total, in-progress, and overdue tasks.
- **Workload Balancing**: Visual distribution of tasks across team members.
- **Activity Log**: A comprehensive history of who did what, when, and where.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion |
| **State/Logic** | React Context API, Lucide Icons, DnD Kit |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL, Prisma ORM |
| **Security** | BCrypt, JWT, HttpOnly Cookies |
| **Deployment** | Vercel (Frontend), Railway (Backend) |

---

## 🏗️ System Architecture

```mermaid
graph TD
    User((User)) -->|HTTPS| Frontend[React SPA - Vercel]
    Frontend -->|API Requests| Backend[Express Server - Railway]
    Backend -->|JWT Auth| AuthMiddleware[Auth Middleware]
    AuthMiddleware -->|Validated| Controllers[Business Logic]
    Controllers -->|ORM| Prisma[Prisma Client]
    Prisma -->|Query| DB[(PostgreSQL)]
```

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- A PostgreSQL database (Local or Cloud)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/MrRitesh21/Team-Task-Manager.git

# Install Server Dependencies
cd server && npm install

# Install Client Dependencies
cd ../client && npm install
```

### 2. Environment Configuration
Create a `.env` in the `/server` directory:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="your_secure_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
CLIENT_URL="http://localhost:5173"
PORT=8080
```

### 3. Database Sync
```bash
cd server
npx prisma db push
```

### 4. Launch
```bash
# Start Backend (from /server)
npm run dev

# Start Frontend (from /client)
npm run dev
```

---

## 🌍 API Reference (Brief)

| Endpoint | Method | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | POST | Create a new user | Public |
| `/api/projects` | GET | List user's projects | Authenticated |
| `/api/projects/:id` | PATCH | Update project details | ADMIN |
| `/api/tasks/project/:id`| POST | Create task in project | MEMBER |
| `/api/projects/:id/members`| POST | Add member to team | ADMIN |

---

## 🎨 UI Aesthetics
- **Color Palette**: Deep Charcoal (#050505), Electric Blue (#4F8EF7), Vivid Purple (#A855F7).
- **Typography**: "Syne" for headings, "DM Sans" for interface text.
- **Effects**: Backdrop blurs, micro-interactions, and glassmorphic card systems.

---

Developed with ❤️ for the **Full-Stack Coding Assignment**.  
[GitHub Repository](https://github.com/MrRitesh21/Team-Task-Manager)
