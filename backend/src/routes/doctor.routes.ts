import { Router } from 'express';
import { DoctorController } from '../controllers/doctorController';

const router = Router();
const doctorController = new DoctorController();

router.post('/', async (req, res, next) => {
    try {
        await doctorController.create(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        await doctorController.getAll(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/available-slots', async (req, res, next) => {
    try {
        await doctorController.getAvailableSlots(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        await doctorController.getById(req, res);
    } catch (error) {
        next(error);
    }
});

export const doctorRoutes = router;