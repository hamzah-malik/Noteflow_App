# 📚 NoteFlow

NoteFlow is a full-stack note-sharing platform that allows users to upload, organize, and securely share notes with friends. Users can request access to private notes, manage folders, receive notifications, and collaborate in a simple and modern interface.

---

## 🚀 Features

- 🔐 JWT Authentication (Login & Registration)
- 👥 Friend Management
- 📂 Folder Organization
- 📝 Upload & Manage Notes
- 🔒 Public & Private Notes
- 📩 Request Access to Private Notes
- 🔔 Notification System
- 📤 Share Notes with Friends
- ☁️ Supabase Storage Integration
- 📱 Responsive User Interface

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- Axios

### Backend
- Django
- Django REST Framework
- JWT Authentication
- Supabase Storage

---

## 📁 Project Structure

```
NoteFlow_App/
│
├── noteflow-backend/
│   ├── apps/
│   ├── config/
│   ├── requirements/
│   └── manage.py
│
└── noteflow-frontend/
    ├── src/
    ├── public/
    └── package.json
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/anasarshad143-lang/NoteFlow_App.git
```

### Backend

```bash
cd noteflow-backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements/dev.txt

python manage.py migrate

python manage.py runserver
```

### Frontend

```bash
cd noteflow-frontend

npm install

npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file inside both frontend and backend folders using the provided `.env.example` files.

> **Do not commit your `.env` files.**

---

## 📸 Screenshots

Screenshots will be added soon.

---

## 👨‍💻 Author

**Anas Bisal**

BS Computer Science

GitHub: https://github.com/anasarshad143-lang
