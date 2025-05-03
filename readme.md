# 🚀 LeetLab

LeetLab is a full-stack coding practice platform that allows users to solve programming problems, compile and execute code in real-time using the [Judge0 API](https://judge0.com/), and track their submissions. It's built with a focus on functionality, simplicity, and developer productivity.

---

## ✨ Features

* 🔐 User Authentication & Authorization (JWT)
* 🧠 Problem Set Interface
* 🔊 Code Editor with Syntax Highlighting
* ⚙️ Judge0 API Integration for Code Execution
* 📈 Submission History & Tracking
* 🗃️ PostgreSQL Database Integration

---

## 💦 Tech Stack

* **Frontend:** React, TailwindCSS
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **Code Execution:** Judge0 API
* **Containerization:** Docker (optional for DB setup)

---

## 🛆 Getting Started

### Prerequisites

* Node.js
* npm or yarn
* PostgreSQL (or use Docker)
* Judge0 API instance (public or self-hosted)

---

### 🔧 Installation

1. **Clone the Repository**

```bash
git clone https://github.com/Blazeiscoding/LeetLab.git
cd LeetLab
```

2. **Start PostgreSQL (with Docker or manually)**

```bash
docker run --name leetlab-db -e POSTGRES_USER=leetlab -e POSTGRES_PASSWORD=leetlab123 -e POSTGRES_DB=leetlabdb -p 5432:5432 -d postgres
```

3. **Configure Environment Variables**

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/postgres
JUDGE0_API_URL=http://localhost:2358/
JWT_SECRET=your_jwt_secret_key
```

4. **Install Backend Dependencies & Start Server**

```bash
cd backend
npm install
npm run dev
```

5. **Install Frontend Dependencies & Start React App**

```bash
cd ../frontend
npm install
npm run dev
```

---

## 🌐 Usage

* Open your browser and visit: [http://localhost:3000](http://localhost:8080)
* Sign up or log in
* Choose a problem to solve
* Write code in the editor and click `Run`
* View output, fix errors, and resubmit

---

## 📁 Folder Structure

```
LeetLab/
│
├── backend/        → Express API, DB, Auth
├── frontend/       → React App with Tailwind
└── README.md       → This file
```

---

## 🧑‍💻 Contributing

Contributions, issues, and feature requests are welcome!
Please open a pull request or create an issue to get started.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Acknowledgments

* [Judge0](https://judge0.com/)
* [PostgreSQL](https://www.postgresql.org/)
* [React](https://reactjs.org/)
