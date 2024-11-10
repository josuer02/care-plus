// src/routes/appointment.routes.ts
import { Router, Request, Response, RequestHandler } from 'express';
import { AppointmentController } from '../controllers/appointmentController';

const router = Router();
const appointmentController = new AppointmentController();

const createAppointment: RequestHandler = async (req, res, next) => {
    try {
        await appointmentController.create(req, res);
    } catch (error) {
        next(error);
    }
};

const rescheduleAppointment: RequestHandler = async (req, res, next) => {
    try {
        await appointmentController.reschedule(req, res);
    } catch (error) {
        next(error);
    }
};

const cancelAppointment: RequestHandler = async (req, res, next) => {
    try {
        await appointmentController.cancel(req, res);
    } catch (error) {
        next(error);
    }
};

const getAppointmentsByDate: RequestHandler = async (req, res, next) => {
    try {
        await appointmentController.getByDate(req, res);
    } catch (error) {
        next(error);
    }
};
const getAllAppointments: RequestHandler = async (req, res, next) => {
    try {
        await appointmentController.getAll(req, res);
    } catch (error) {
        next(error);
    }
};

router.get('/', getAllAppointments);
router.get('/by-date', getAppointmentsByDate);
router.post('/', createAppointment);
router.put('/:id/reschedule', rescheduleAppointment);
router.put('/:id/cancel', cancelAppointment);

export const appointmentRoutes = router;