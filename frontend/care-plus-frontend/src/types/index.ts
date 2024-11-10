// src/types/index.ts

export type AppointmentFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    doctorId: string;
    datetime: Date;
  };
export interface Patient {
    _id: string;
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
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    appointments?: Appointment[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Appointment {
    _id: string;
    datetime: Date;
    patientId: string;
    doctorId: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    patient?: Patient;
    doctor?: Doctor;
    createdAt: Date;
    updatedAt: Date;
  }
  
