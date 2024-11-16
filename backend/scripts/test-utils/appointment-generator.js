// scripts/test-utils/appointment-generator.js
export const generateAppointments = (count = 8) => {
    const appointments = [];
    const baseDate = new Date('2024-11-16T08:00:00Z');
    
    for (let i = 0; i < count; i++) {
      appointments.push({
        doctorId: 1,
        patientId: (i % 2) + 1,
        datetime: new Date(baseDate.getTime() + (i * 60 * 60 * 1000)).toISOString()
      });
    }
    
    return appointments;
  };