import { Request, Response } from 'express';
import { AppointmentRepository } from '../repositories/appointmentRepository';

export class AppointmentController {
    private appointmentRepo: AppointmentRepository;

    constructor() {
        this.appointmentRepo = new AppointmentRepository();
        // Bind all methods
        this.create = this.create.bind(this);
        this.reschedule = this.reschedule.bind(this);
        this.cancel = this.cancel.bind(this);
        this.getByDate = this.getByDate.bind(this);
    }

    async create(req: Request, res: Response) {
        try {
            const { patientId, doctorId, datetime } = req.body;

            // Check doctor availability
            const isAvailable = await this.appointmentRepo.checkDoctorAvailability(doctorId, new Date(datetime));
            if (!isAvailable) {
                return res.status(400).json({ error: 'Doctor is not available at this time' });
            }

            const appointment = await this.appointmentRepo.create({
                patient: { connect: { id: patientId } },
                doctor: { connect: { id: doctorId } },
                datetime: new Date(datetime),
                status: 'SCHEDULED'
            });

            return res.status(201).json(appointment);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create appointment' });
        }
    }

    async reschedule(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { datetime } = req.body;

            const appointment = await this.appointmentRepo.update(Number(id), {
                datetime: new Date(datetime)
            });

            return res.json(appointment);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to reschedule appointment' });
        }
    }

    async cancel(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const appointment = await this.appointmentRepo.update(Number(id), {
                status: 'CANCELLED'
            });

            return res.json(appointment);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to cancel appointment' });
        }
    }

    async getByDate(req: Request, res: Response) {
        try {
            const { date } = req.query;
            if (!date || typeof date !== 'string') {
                return res.status(400).json({ error: 'Valid date is required' });
            }
    
            const searchDate = new Date(date);
            const appointments = await this.appointmentRepo.findByDate(searchDate);
    
            return res.json({
                date: date,
                total: appointments.length,
                appointments: appointments
            });
        } catch (error) {
            console.error('Error in getByDate:', error);
            return res.status(500).json({ error: 'Failed to fetch appointments' });
        }
    }
    async getAll(req: Request, res: Response) {
        try {
            const appointments = await this.appointmentRepo.findAll();
            return res.json(appointments);
        } catch (error) {
            console.error('Error in getAll:', error);
            return res.status(500).json({ error: 'Failed to fetch appointments' });
        }
    }
}