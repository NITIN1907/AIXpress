# 🚀 AIxPress – AI Powered SaaS Content Platform

A full-stack AI SaaS platform built with scalable, production-ready architecture using **Express.js, React.js, Redis, BullMQ, Neon DB, and Cloudinary**.

AIxPress allows users to generate, enhance, and manipulate AI-powered content — including articles, images, PDF summaries, and background/object removal — inside a secure and scalable SaaS environment.

---

## 🌐 Live Demo

🔗 **Frontend:** https://your-vercel-link.vercel.app  
🔗 **Backend API:** https://your-render-link.onrender.com  

---

## 🧠 Features

### ✍️ Content Creation
- 📝 AI Article Generator  
- 💡 Blog Title Generator  
- 📄 PDF Summary Generator  
- 🧠 Article Improver  

### 🎨 Image Tools
- 🖼️ AI Image Generator  
- 🧹 Background Remover  
- ✂️ Object Removal Tool  

### 👥 Community
- Share AI creations  
- Explore community posts  

### 🔐 Authentication & Security
- Clerk Authentication (JWT-based secure auth)
- User-based content isolation
- Secure API endpoints

---

## ⚡ Scalable Architecture

- Queue-based AI processing using **BullMQ + Redis**
- Background workers for heavy AI tasks
- Non-blocking API design
- Horizontally scalable
- Production-ready SaaS architecture

---

## Without a queue:

- HTTP request stays open for 20–60 seconds

- Server threads get blocked

- Multiple users = server crash

- AI API rate limits get hit

- Memory spikes

- Bad user experience

## with queue:
 1. Non-Blocking API (Fast Response)

### Before:
POST /pdf-summary → waits 30 seconds


### Now:
POST /pdf-summary → returns instantly (Job Created)


### User gets:

{
  "status": "processing",
  "jobId": "1234"
}


This improves:

- UX

- Server performance
  
2. Controlled Concurrency (Very Important)

With BullMQ worker:

new Worker("pdfQueue", processor, {
  concurrency: 5
})


This means:

- Only 5 AI jobs run at once

- Prevents OpenAI rate limits

- Prevents CPU spikes

- Prevents memory crash

3. Retry & Failure Handling

If OpenAI fails:

### BullMQ can:

- Retry job 3 times

- Move failed job to Dead Letter Queue

- Log error

### Without queue:

- User loses request

- You lose data

- No tracking
  
4. Horizontal Scalability

If traffic increases:

You can scale like this:

- 1 API Server
- 5 Worker Servers
- 1 Redis

Each worker pulls jobs from Redis.

More traffic?

👉 Add more workers.

---
## 🏗️ Tech Stack

### 🖥️ Frontend
- React.js  
- Tailwind CSS  
- Axios  
- React Markdown  

### 🛠️ Backend
- Express.js  
- Node.js  
- BullMQ (Job Queue)  
- Redis (Queue + Caching)  
- Neon DB (PostgreSQL)  
- Cloudinary (Image Storage)  
- Clerk (Authentication)  

---

## 🚀 DevOps & Deployment

- GitHub Actions (CI/CD)
- Render (Backend Deployment)
- Vercel (Frontend Deployment)

---

## 🧩 System Architecture

```
Client (React)
      ↓
Express API
      ↓
Redis Queue (BullMQ)
      ↓
Worker Processes (AI Tasks)
      ↓
Neon PostgreSQL Database
      ↓
Cloudinary (Image Storage)
```

### 💡 Why Queue-Based Architecture?

- Prevents API timeouts for heavy AI tasks  
- Improves scalability under load  
- Enables background processing  
- Follows real-world SaaS production patterns  

---

## 📊 Database Schema (Example)

```sql
CREATE TABLE creations (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 CI/CD Pipeline

GitHub Actions automates:

- Dependency installation  
- Lint checks  
- Build verification  
- Automatic deployment to:
  - Render (Backend)
  - Vercel (Frontend)

---

## ⚙️ Environment Variables

### Backend (.env)

```
PORT=
DATABASE_URL=
CLERK_SECRET_KEY=
REDIS_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
AI_API_KEY=
```

### Frontend (.env)

```
VITE_BASE_URL=
VITE_CLERK_PUBLISHABLE_KEY=
```

---

## 🚀 Getting Started (Local Setup)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/aixpress.git
cd aixpress
```

### 2️⃣ Install Backend

```bash
cd server
npm install
npm run dev
```

### 3️⃣ Install Frontend

```bash
cd client
npm install
npm run dev
```

---

## 📈 Scalability Considerations

- Non-blocking architecture  
- Background job processing  
- Modular controller structure  
- Production-grade database (Neon)  
- Cloud-based file storage  
- Horizontal scaling ready  

---

## 💡 Future Improvements

- Usage-based billing (Stripe integration)  
- Admin analytics dashboard  
- Rate limiting per user  
- AI response caching layer  
- WebSocket live job status tracking  
- Microservices architecture  

---

## 🎯 Why This Project Stands Out

✔ Production-level architecture  
✔ Background job processing (BullMQ)  
✔ Real-world SaaS design  
✔ Authentication + database isolation  
✔ CI/CD integrated  
✔ Cloud deployment  
✔ Scalable & maintainable  

---

## 👨‍💻 Author

**Nitin Dogra**

If you like this project, feel free to ⭐ the repository!
