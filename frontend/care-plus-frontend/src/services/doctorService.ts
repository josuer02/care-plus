// src/services/doctorService.ts
import api from './api';
import { Doctor } from '@/types';
import { format } from 'date-fns';

export const doctorService = {
  async getAll() {
    const response = await api.get<Doctor[]>('/doctors');
    return response.data;
  },

  async getAvailableSlots(doctorId: number, date: Date) {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log('Requesting slots with params:', { doctorId, date: formattedDate });
      const response = await api.get(`/doctors/available-slots`, {
        params: { doctorId, date: formattedDate },
      });
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAvailableSlots:', error);
      throw error;
    }
  }
};