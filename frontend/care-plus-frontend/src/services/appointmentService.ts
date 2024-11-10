// src/services/appointmentService.ts
import api from './api';
import { Appointment, AppointmentFormData } from '@/types';
import { format } from 'date-fns';

export const appointmentService = {
  async create(data: AppointmentFormData) {
    // First create or find patient
    const patientResponse = await api.get(`/patients/search?phone=${data.phone}`);
    let patientId: string;

    if (patientResponse.status === 404) {
      // Create new patient
      const newPatient = await api.post('/patients', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
      });
      patientId = newPatient.data._id;
    } else {
      patientId = patientResponse.data._id;
    }

    // Create appointment
    const response = await api.post('/appointments', {
      patientId,
      doctorId: data.doctorId,
      datetime: data.datetime,
    });

    return response.data;
  },

  async getAll() {
    const response = await api.get('/appointments');
    return response.data;
  },

  getByDate: async (date: Date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log('Requesting appointments for date:', formattedDate); // Add this log
      const response = await api.get(`/appointments?date=${formattedDate}`);
      return response.data;
    } catch (error) {
      console.error('Error in getByDate:', error);
      throw error;
    }
  },

  async reschedule(id: string, datetime: Date) {
    const response = await api.put(`/appointments/${id}/reschedule`, {
      datetime,
    });
    return response.data;
  },

  async cancel(id: string) {
    const response = await api.put(`/appointments/${id}/cancel`);
    return response.data;
  },
};