# Xentra-Logistics

<p align="center">
  <strong>Modern logistics management platform</strong> built with React and TypeScript
</p>

---

## 📋 Overview

Xentra-Logistics is a comprehensive logistics management platform designed to streamline order tracking, route optimization, and fleet management. Built with modern web technologies and deployed with containerization for scalability.

## 🛠️ Tech Stack

### Frontend
- **React 18+** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tooling
- **JavaScript ES6+** - Modern JavaScript

### Tools & Infrastructure
- **Docker** - Containerization
- **Nginx** - Web server / reverse proxy
- **Git** - Version control
- **Node.js** - Runtime environment

## ✨ Features

- 📦 **Order Management** - Create, track, and manage shipments in real-time
- 🗺️ **Route Optimization** - Intelligent route planning for efficient deliveries
- 📊 **Dashboard Analytics** - Real-time statistics and performance metrics
- 🚚 **Fleet Tracking** - Monitor vehicle location and status
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔄 **Real-time Updates** - Live order status notifications

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16+)
- **npm** or **yarn**
- **Docker** (optional, for containerized deployment)

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/levapo97-cell/Xentra-Logistics.git
   cd Xentra-Logistics
```

2. **Install dependencies**
```bash
   npm install
```

3. **Start development server**
```bash
   npm run dev
```
   
   The application will be available at `http://localhost:5173`

### Docker Deployment

```bash
# Build the Docker image
docker build -t xentra-logistics .

# Run the container
docker run -p 80:80 xentra-logistics
```

Access the application at `http://localhost`

## 📁 Project Structure
