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
    return prisma.patient.create({
      data
    });
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

  async update(id: number, data: Prisma.PatientUpdateInput): Promise<Patient> {
    return prisma.patient.update({
      where: { id },
      data
    });
  }

  async findById(id: number): Promise<Patient | null> {
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