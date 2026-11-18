# ♻️ WasteWise – Intelligent Waste Collection & Route Optimization System

WasteWise is an intelligent waste management platform designed to monitor waste-bin fill levels, predict bin overflow, optimize waste collection routes, and manage collection operations through a centralized dashboard.

The system combines the MERN stack with machine learning to support smarter and more efficient waste collection.

## 🚀 Key Features

### 1. Smart Bin Management
- Add, view, update, and delete waste bins.
- Monitor bin fill levels and capacity.
- Track waste categories and bin locations.
- View bin priority information.

### 2. Machine Learning-Based Prediction
- Predict future bin fill levels.
- Estimate the time remaining before a bin becomes full.
- Help identify bins that may require collection.

### 3. Intelligent Route Optimization
- Assign collection bins to available trucks.
- Generate optimized collection routes.
- Calculate route distance and estimated waste load.
- Display collection locations on a map.
- Monitor remaining truck capacity.

### 4. Truck Fleet Management
- Add and manage collection trucks.
- Update truck and driver information.
- Track truck capacity and current load.
- Delete trucks when required.

### 5. Collection Management
- Start collection operations.
- Mark individual bins as collected.
- Track collection progress.
- Maintain collection history and completed records.

### 6. Dashboard
- Monitor waste-bin statistics.
- View truck information.
- Track collection activities.
- Access important waste-management information in one place.

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Machine Learning | Python |
| API Communication | REST APIs |
| Development Tools | VS Code, Git, GitHub |

## 📁 Project Structure

```text
Intelligent-Waste-Optimization/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   └── package.json
│
├── ml/
│   ├── api.py
│   ├── train_model.py
│   └── fill_prediction_model.pkl
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites
- Node.js and npm
- Python
- MongoDB Atlas account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/swaroopmantur/Intelligent-Waste-Optimization.git
```

```bash
cd Intelligent-Waste-Optimization
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Configure your backend environment variables in a `.env` file. Use the variable names expected by your backend configuration, including your MongoDB connection string and required API settings.

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local frontend URL displayed in your terminal, usually:

```text
http://localhost:5173
```

### 4. Machine Learning Setup

Install the Python dependencies required by the ML module using its dependency file, if provided.

Configure the ML API and model path according to the project configuration before starting the prediction service.

## 🔄 System Workflow

1. Waste bins are registered and stored in MongoDB.
2. The dashboard retrieves bin and truck information.
3. The ML module predicts future bin fill levels.
4. The route optimization module selects eligible bins for collection.
5. Collection routes are assigned to available trucks.
6. Collection operations are started and tracked.
7. Completed collection records are stored and displayed in collection history.

## 🎯 Project Objectives

- Improve waste collection efficiency.
- Reduce unnecessary collection trips.
- Monitor bin capacity and overflow risks.
- Support better utilization of collection trucks.
- Provide centralized waste-management monitoring.

## 🔮 Future Enhancements

- Real-time IoT-based bin monitoring.
- Live GPS tracking of collection vehicles.
- Weather-aware collection scheduling.
- Advanced route optimization algorithms.
- Notifications for critical bin levels.
- Role-based access for administrators and collection staff.

## 👨‍💻 Developer

**Swaroop Mantur**

Information Science and Engineering

Siddaganga Institute of Technology, Tumkur

GitHub: https://github.com/swaroopmantur

---

*WasteWise – Making Waste Collection Smarter and More Efficient.*