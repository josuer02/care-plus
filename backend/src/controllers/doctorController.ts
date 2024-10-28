import { Request, Response } from 'express';
import { DoctorRepository } from '../repositories/doctorRepository';

export class DoctorController {
    private doctorRepo: DoctorRepository;

    constructor() {
        this.doctorRepo = new DoctorRepository();
    }

    async create(req: Request, res: Response) {
        try {
            const { firstName, lastName, email } = req.body;
            
            // Validate required fields
            if (!firstName || !lastName || !email) {
                return res.status(400).json({ 
                    error: 'First name, last name, and email are required' 
                });
            }

            const doctor = await this.doctorRepo.create({
                firstName,
                lastName,
                email
            });

            return res.status(201).json(doctor);
        } catch (error: any) {
            // Handle unique constraint violation
            if (error.code === 'P2002') {
                return res.status(400).json({ 
                    error: 'A doctor with this email already exists' 
                });
            }
            return res.status(500).json({ error: 'Failed to create doctor' });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const doctors = await this.doctorRepo.findAll();
            return res.json(doctors);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch doctors' });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const doctor = await this.doctorRepo.findById(Number(id));
            
            if (!doctor) {
                return res.status(404).json({ error: 'Doctor not found' });
            }

            return res.json(doctor);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch doctor' });
        }
    }

    async getAvailableSlots(req: Request, res: Response) {
        try {
            const { doctorId, date } = req.query;
            
            if (!doctorId || !date) {
                return res.status(400).json({ 
                    error: 'Doctor ID and date are required' 
                });
            }
    
            // First check if doctor exists
            const doctor = await this.doctorRepo.findById(Number(doctorId));
            if (!doctor) {
                return res.status(404).json({ error: 'Doctor not found' });
            }
    
            const requestDate = new Date(date as string);
            const availableSlots = await this.doctorRepo.getAvailableTimeSlots(
                Number(doctorId),
                requestDate
            );
    
            return res.json({ 
                date: requestDate.toISOString().split('T')[0],
                availableSlots,
                timezone: "UTC",
                workingHours: {
                    start: "08:00",
                    end: "17:00"
                }
            });
        } catch (error) {
            console.error('Error in getAvailableSlots:', error);
            return res.status(500).json({ error: 'Failed to fetch available slots' });
        }
    }
}