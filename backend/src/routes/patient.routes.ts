import { Router } from 'express';
import { PatientController } from '../controllers/patientController';
import { Request, Response } from 'express';

const router = Router();
const patientController = new PatientController();

router.get('/search', async (req: Request, res: Response) => {
    await patientController.findByPhone(req, res);
});

router.post('/', async (req: Request, res: Response) => {
    await patientController.create(req, res);
});

router.get('/', async (req, res, next) => {
    try {
        await patientController.getAll(req, res);
    } catch (error) {
        next(error);
    }
});

export const patientRoutes = router;