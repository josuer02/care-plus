// src/services/patientService.ts
import api from './api';
import { Patient } from '@/types';

export const patientService = {
  async findByPhone(phone: string) {
    const response = await api.get<Patient>(`/patients/search?phone=${phone}`);
    return response.data;
  },

  async create(patientData: Partial<Patient>) {
    const response = await api.post<Patient>('/patients', patientData);
    return response.data;
  },
};