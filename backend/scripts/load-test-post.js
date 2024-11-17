// scripts/load-test-post.js
import autocannon from 'autocannon';

// Generamos citas para una semana
const generateWeekAppointments = () => {
  const appointments = [];
  const startDate = new Date('2024-11-18T08:00:00.000Z');
  
  // Usamos IDs de MongoDB (necesitarás reemplazar estos con IDs reales de tu base de datos)
  const doctorId = "673901e285e3b479b47f29ca"; 
  const patientIds = [
    "67302f9d32d067fc9655c69b", 
    "6739019f85e3b479b47f29c9"  
  ];
  
  // 5 días laborables
  for (let day = 0; day < 5; day++) {
    // 8 citas por día
    for (let hour = 0; hour < 8; hour++) {
      const appointmentDate = new Date(startDate);
      appointmentDate.setDate(startDate.getDate() + day);
      appointmentDate.setHours(startDate.getHours() + hour);
      
      appointments.push({
        doctorId: doctorId,
        patientId: patientIds[hour % 2],
        datetime: appointmentDate.toISOString()
      });
    }
  }
  return appointments;
};

const appointments = generateWeekAppointments();
let currentIndex = 0;

console.log(Starting load test with ${appointments.length} appointments for one week...);
console.log('Sample appointments:', appointments.slice(0, 3));

const instance = autocannon({
  url: 'http://localhost:3002/api/appointments', // Cambiado a puerto 3002
  connections: 5,
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
  console.log(- Total appointments tested: ${appointments.length});
  console.log(- Requests per second: ${results.requests.average});
  console.log(- Average latency: ${results.latency.average}ms);
  console.log(- Max latency: ${results.latency.max}ms);
  console.log(- Total requests: ${results.requests.total});
});
