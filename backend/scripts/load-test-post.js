// scripts/load-test-post.js
import autocannon from 'autocannon';

// Generamos citas para una semana (asumiendo 8 citas por día)
const generateWeekAppointments = () => {
  const appointments = [];
  const startDate = new Date('2024-10-18T08:00:00.000Z');
  
  // 5 días laborables
  for (let day = 0; day < 5; day++) {
    // 8 citas por día
    for (let hour = 0; hour < 8; hour++) {
      const appointmentDate = new Date(startDate);
      appointmentDate.setDate(startDate.getDate() + day);
      appointmentDate.setHours(startDate.getHours() + hour);
      
      appointments.push({
        doctorId: 1,
        patientId: (hour % 2) + 1,
        datetime: appointmentDate.toISOString()
      });
    }
  }
  return appointments;
};

const appointments = generateWeekAppointments();
let currentIndex = 0;

console.log(`Starting load test with ${appointments.length} appointments for one week...`);
console.log('Sample appointments:', appointments.slice(0, 3));

const instance = autocannon({
  url: 'http://localhost:3001/api/appointments',
  connections: 5, // Aumentamos conexiones simultáneas
  duration: 30,
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  },
  setupClient: (client) => {
    client.on('response', () => {
      currentIndex = (currentIndex + 1) % appointments.length;
      const nextBody = JSON.stringify(appointments[currentIndex]);
      client.setBody(nextBody);
    });
  },
  body: JSON.stringify(appointments[0])
});

autocannon.track(instance);

instance.on('done', (results) => {
  console.log('\nTest completed!');
  console.log('Summary:');
  console.log(`- Total appointments tested: ${appointments.length}`);
  console.log(`- Requests per second: ${results.requests.average}`);
  console.log(`- Average latency: ${results.latency.average}ms`);
  console.log(`- Max latency: ${results.latency.max}ms`);
  console.log(`- Total requests: ${results.requests.total}`);
});