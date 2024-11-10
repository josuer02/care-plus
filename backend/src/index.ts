import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { appointmentRoutes } from './routes/appointment.routes.js';
import { patientRoutes } from './routes/patient.routes.js';
import { doctorRoutes } from './routes/doctor.routes.js'; 
import { performanceMiddleware } from './middleware/performanceMiddleware.js';
import { limiter } from './middleware/rateLimiter.js';
import  healthRoutes  from './routes/health.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.use(performanceMiddleware);
app.use(limiter);
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);  // Add this line

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});