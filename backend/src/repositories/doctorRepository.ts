// src/repositories/doctorRepository.ts
import prisma from '../config/database';
import { Doctor, Prisma, Appointment } from '@prisma/client';

export class DoctorRepository {
  async create(data: Prisma.DoctorCreateInput): Promise<Doctor> {
    return prisma.doctor.create({
      data
    });
  }

  async findAll(): Promise<Doctor[]> {
    return prisma.doctor.findMany({
      include: {
        appointments: true
      }
    });
  }

  async findById(id: string): Promise<Doctor | null> {
    return prisma.doctor.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            patient: true
          }
        }
      }
    });
  }

  async getAvailableTimeSlots(doctorId: string, date: Date): Promise<Date[]> {
    // Create date for the requested day
    const requestedDate = new Date(date);
    requestedDate.setUTCHours(0, 0, 0, 0);

    // Create start and end times for the working day (8 AM to 5 PM)
    const startOfDay = new Date(requestedDate);
    startOfDay.setUTCHours(8, 0, 0, 0);

    const endOfDay = new Date(requestedDate);
    endOfDay.setUTCHours(17, 0, 0, 0);

    const bookedAppointments = await prisma.appointment.findMany({
        where: {
            doctorId,
            datetime: {
                gte: startOfDay,
                lt: endOfDay
            },
            status: 'SCHEDULED'
        }
    });

    const bookedTimes = new Set(
        bookedAppointments.map((appointment: Appointment) => 
            new Date(appointment.datetime).getTime()
        )
    );

    const availableSlots: Date[] = [];
    const currentSlot = new Date(startOfDay);

    // Generate hourly slots from 8 AM to 4 PM (last appointment at 4 PM)
    while (currentSlot < endOfDay) {
        if (!bookedTimes.has(currentSlot.getTime())) {
            availableSlots.push(new Date(currentSlot));
        }
        currentSlot.setUTCHours(currentSlot.getUTCHours() + 1);
    }

    return availableSlots;
}

  async update(id: string, data: Prisma.DoctorUpdateInput): Promise<Doctor> {
    return prisma.doctor.update({
      where: { id },
      data
    });
  }
}