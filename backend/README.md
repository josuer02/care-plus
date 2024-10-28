# Care+ Backend API Documentation

## Overview

Care+ is a medical appointment management system that allows patients to book appointments with doctors. This backend API provides endpoints for managing doctors, patients, and appointments.

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- npm or yarn package manager

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install
```

## Database Setup

```bash
# Start the database using Docker
docker-compose up -d

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

## Environment Variables

Create a `.env` file in the root directory with the following contents:

```env
# Database
DATABASE_URL="postgresql://admin:password123@localhost:5430/medical_db"

# Server
PORT=3001
NODE_ENV=development
```

## Running the Application

```bash
# Development mode with hot reload
npm run dev

# Build and run for production
npm run build
npm start
```

## API Endpoints

### Appointments

```typescript
// Get all appointments
GET /api/appointments

// Create appointment
POST /api/appointments
Body: {
    "patientId": number,
    "doctorId": number,
    "datetime": string (ISO date)
}
```

### Health Check

```typescript
// Get system health
GET /api/health
Response: {
    "status": "healthy",
    "timestamp": string,
    "uptime": number,
    "dbResponseTime": string,
    "memory": {
        "free": number,
        "total": number,
        "used": number
    },
    "cpu": number[]
}
```
