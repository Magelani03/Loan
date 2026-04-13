# Tech stack — AUNTY D (Loan application)

Monorepo-style layout: **customer frontend**, **admin frontend**, and **backend** are separate packages with their own `package.json`.

---

## 1. Customer frontend (`frontend/`)

| Category | Technology |
|----------|------------|
| Language | **TypeScript** |
| UI library | **React 18** |
| Build / dev server | **Vite 4** |
| Routing | **React Router 6** |
| Styling | **Tailwind CSS 3** + **tailwindcss-animate** |
| Components | **Radix UI** primitives (accordion, dialog, dropdown, etc.) |
| Icons | **lucide-react** |
| Forms / validation | **react-hook-form** (where used) |
| Charts | **recharts** |
| Utilities | **clsx**, **tailwind-merge**, **class-variance-authority** |
| Toasts | **sonner** + shadcn-style toast hooks |

---

## 2. Admin frontend (`admin-frontend/`)

| Category | Technology |
|----------|------------|
| Language | **TypeScript** |
| UI library | **React 18** |
| Build / dev server | **Vite 4** |
| Routing | **React Router 6** |
| Styling | **Tailwind CSS 4** (PostCSS pipeline) |

*Leaner stack than the customer app: no Radix bundle; custom CSS in `index.css`.*

---

## 3. Backend (`backend/`)

| Category | Technology |
|----------|------------|
| Runtime | **Node.js** |
| Language | **TypeScript** (compiled with `tsc`; dev may use **ts-node**) |
| HTTP framework | **Express 4** |
| ORM | **Prisma 6** (**@prisma/client**) |
| Database | **PostgreSQL** (via `DATABASE_URL`) |
| Auth | **jsonwebtoken** (JWT), **bcryptjs** (password hashing) |
| File uploads | **multer** (disk storage) |
| Email | **nodemailer** (SMTP) |
| Config | **dotenv** |
| CORS | **cors** |

---

## 4. Data & tooling

| Item | Technology |
|------|------------|
| Schema & migrations | **Prisma schema** (`backend/prisma/schema.prisma`), Prisma Migrate |
| Static assets (customer) | Vite public folder, images under `src/assets/` |

---

## 5. Typical deployment tooling

| Purpose | Examples (not enforced in code) |
|---------|----------------------------------|
| Customer / admin sites | **Vercel** (or any static host) |
| API | **Render**, **Railway**, etc. |
| Database | **Neon**, **Supabase**, or any PostgreSQL provider |

---

## 6. Version summary

Exact versions can drift; always check each `package.json`. At documentation time:

- **React** ~18.2  
- **Vite** ~4.4  
- **Express** ~4.19  
- **Prisma** ~6.19  
- **TypeScript** 5.x  

---

*For how these pieces connect, see `SYSTEM_ARCHITECTURE.md`.*
