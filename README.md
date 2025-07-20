# 🎨 Collaborative Whiteboard App

![Demo GIF](demo.gif) <!-- Add your demo GIF here -->

A real-time collaborative whiteboard built with **Node.js**, **Socket.IO**, **MongoDB**, and **HTML5 Canvas**. Multiple users can draw on the same board and see updates in real time.

## ✨ Features

- Real-time drawing synchronization
- Persistent drawing data with MongoDB
- Unique room IDs for collaboration
- Cross-device compatibility
- Simple and responsive UI
- Live cursor tracking
- Adjustable brush size and colors

## 🛠️ Tech Stack

**Backend:**
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socket.io)

**Frontend:**
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

**Database:**
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)

# 📂 Project Structure
collaborative-whiteboard/
├── server/

│ ├── model/

│ │ └── Room.js # MongoDB schema

│ ├── routes/

│ │ └── index.js # API routes

│ ├── socket/

│ │ └── index.js # Socket.IO handlers

│ └── server.js # Express server

├── public/

│ ├── index.html # Frontend HTML

│ ├── style.css # Stylesheet

│ └── script.js # Canvas logic

├── .env.example # Environment template

└── README.md # Documentation


# 🚀 Getting Started

### 1. Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas URI)
- npm (v6+)

### 2. Installation

#### 1. Clone the repository
git clone https://github.com/your-username/collaborative-whiteboard.git
cd collaborative-whiteboard

#### 2. Install dependencies
npm install

#### 3. Configuration
Create a .env file based on the example:
cp .env.example .env

Edit the .env file:

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/whiteboard
PORT=5000
#### 4. Running the Application
Start the server
npm start

## Access the app at:
http://localhost:5000


## 🌐 Deployment Options
You can deploy this app on:

Render – Easy setup for full-stack apps (Free tier available)

Railway – Simple backend deployment

Vercel / Netlify – For static frontend (client only)

Fly.io / Heroku – Great for full backend deployment

MongoDB Atlas – Cloud MongoDB hosting

## 🧹 To-Do / Improvements
Add user avatars or visible cursors

Support for erasing

Export canvas as an image

Authentication for rooms (optional)

Add real-time chat alongside canvas

## 📄 License

This project is licensed under the MIT License.

Feel free to use, fork, and modify.

## 🤝 Contributing

Pull requests are welcome!

For major changes, please open an issue first to discuss what you would like to change.


🙋‍♂️ Author

Saad Mehmood

Crafted with ❤️ using Node.js and Socket.IO

