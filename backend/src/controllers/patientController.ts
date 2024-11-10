// src/controllers/patientController.ts
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
            
            // Validación de campos requeridos
            if (!firstName || !lastName || !email || !phone || !dateOfBirth) {
                return res.status(400).json({ 
                    error: 'All fields are required',
                    missing: Object.entries({ firstName, lastName, email, phone, dateOfBirth })
                        .filter(([_, value]) => !value)
                        .map(([key]) => key)
                });
            }
    
            const patient = await this.patientRepo.create({
                firstName,
                lastName,
                email,
                phone,
                dateOfBirth: new Date(dateOfBirth)
            });
    
            return res.status(201).json(patient);
        } catch (error: any) {
            console.error('Error creating patient:', error); // Log completo del error
    
            // Manejo específico de errores de Prisma
            if (error.code === 'P2002') {
                return res.status(400).json({ 
                    error: 'A patient with this email or phone already exists',
                    field: error.meta?.target?.[0]
                });
            }
    
            return res.status(500).json({ 
                error: 'Failed to create patient',
                details: error.message,
                code: error.code
            });
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