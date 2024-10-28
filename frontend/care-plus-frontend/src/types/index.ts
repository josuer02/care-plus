// src/types/index.ts

export type AppointmentFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    doctorId: number;
    datetime: Date;
  };
export interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    appointments?: Appointment[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Doctor {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    appointments?: Appointment[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Appointment {
    id: number;
    datetime: Date;
    patientId: number;
    doctorId: number;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    patient?: Patient;
    doctor?: Doctor;
    createdAt: Date;
    updatedAt: Date;
  }
  
