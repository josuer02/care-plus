// src/repositories/patientRepository.ts
import prisma from '../config/database';
import { Patient, Prisma } from '.prisma/client';

export class PatientRepository {
    async findAll(): Promise<Patient[]> {
        return prisma.patient.findMany({
          include: {
            appointments: {
              include: {
                doctor: true
              }
            }
          }
        });
      }
      async create(data: Prisma.PatientCreateInput): Promise<Patient> {
        try {
            return await prisma.patient.create({
                data: {
                    ...data,
                    dateOfBirth: new Date(data.dateOfBirth) // Asegurarse que la fecha es válida
                }
            });
        } catch (error) {
            console.error('Repository error:', error);
            throw error;
        }
    }
  async findByPhone(phone: string): Promise<Patient | null> {
    return prisma.patient.findUnique({
      where: { phone },
      include: {
        appointments: {
          include: {
            doctor: true
          }
        }
      }
    });
  }

  async update(id: string, data: Prisma.PatientUpdateInput): Promise<Patient> {
    return prisma.patient.update({
      where: { id },
      data
    });
  }

  async findById(id: string): Promise<Patient | null> {
    return prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            doctor: true
          }
        }
      }
    });
  }
}