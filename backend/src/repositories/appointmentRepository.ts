import prisma from '../config/database';
import { Appointment, Prisma } from '.prisma/client';

export class AppointmentRepository {
  async create(data: Prisma.AppointmentCreateInput): Promise<Appointment> {
    return prisma.appointment.create({
      data,
      include: {
        patient: true,
        doctor: true
      }
    });
  }

  async findById(id: number): Promise<Appointment | null> {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true
      }
    });
  }

  async checkDoctorAvailability(doctorId: number, datetime: Date): Promise<boolean> {
    const startTime = new Date(datetime);
    const endTime = new Date(datetime);
    endTime.setHours(endTime.getHours() + 1);

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        datetime: {
          gte: startTime,
          lt: endTime
        },
        status: 'SCHEDULED'
      }
    });

    return !existingAppointment;
  }

  async findByDate(date: Date): Promise<Appointment[]> {
    // Create date for the requested day
    const requestedDate = new Date(date);
    requestedDate.setUTCHours(0, 0, 0, 0);

    const startOfDay = new Date(requestedDate);
    const endOfDay = new Date(requestedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return prisma.appointment.findMany({
        where: {
            datetime: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        include: {
            patient: true,
            doctor: true
        },
        orderBy: {
            datetime: 'asc'
        }
    });
  }

  async update(id: number, data: Prisma.AppointmentUpdateInput): Promise<Appointment> {
    return prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: true,
        doctor: true
      }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.appointment.delete({
      where: { id }
    });
  }

  async findByPatientId(patientId: number): Promise<Appointment[]> {
    return prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: true
      },
      orderBy: {
        datetime: 'desc'
      }
    });
  }
  async findAll(): Promise<Appointment[]> {
    return prisma.appointment.findMany({
        include: {
            patient: true,
            doctor: true
        },
        orderBy: {
            datetime: 'asc'
        }
    });
  }
}