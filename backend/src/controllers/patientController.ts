import { Request, Response } from 'express';
import { PatientRepository } from '../repositories/patientRepository';

export class PatientController {
    private patientRepo: PatientRepository;

    constructor() {
        this.patientRepo = new PatientRepository();
        // Bind all methods
        this.findByPhone = this.findByPhone.bind(this);
        this.create = this.create.bind(this);
    }

    async findByPhone(req: Request, res: Response) {
        try {
            const { phone } = req.query;
            const patient = await this.patientRepo.findByPhone(phone as string);
            
            if (!patient) {
                return res.status(404).json({ error: 'Patient not found' });
            }

            return res.json(patient);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch patient' });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { firstName, lastName, email, phone, dateOfBirth } = req.body;
            
            const patient = await this.patientRepo.create({
                firstName,
                lastName,
                email,
                phone,
                dateOfBirth: new Date(dateOfBirth)
            });

            return res.status(201).json(patient);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create patient' });
        }
    }
    async getAll(req: Request, res: Response) {
        try {
            const patients = await this.patientRepo.findAll();
            return res.json(patients);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch patients' });
        }
    }
}