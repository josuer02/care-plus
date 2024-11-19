## Información general
### Usted se encuentra en la branch `master`. 
En esta branch se encuentra actualmente el proyecto llevado a cabo en SQL sin indices. 

Para visualizar SQL con índices se puede dirigir al commit de esta branch titulado `Update README` con SHA `b708e16984dce34c1386944e4d3793ce4c69fe2c`

Para visualizar el proyecot migrado a MongoDB (NosSQL) dirijase a la branch titulada `nosql-migration`. Sin embargo, la bitácora, evaluación y discusión de resultados del proyecto en general los encnontrará en esta branch.

En la branch `nosql-migration` el codigo fue reutilizado y no hubo cambios singificativos, más que en `src\models\prisma\schema.prisma` y el archivo `docker-compose.yml`. Ambos dentro de la carpeta backend.

### Bitácora
Usted puede encontrar la bitacora del presente proyecto en el archivo `bitacora.pdf`. En ella encontrará la documentación respectiva y detallada como también presentación y discusión de resultados obtenidos durante las fases de testing.

### Anexos
Load testing - https://docs.google.com/spreadsheets/d/1gMiQwqffgLYEuXyWnOrkMtU7VS-km-hhcN_jmlnfHGQ/edit?usp=sharing

Presentación - https://www.canva.com/design/DAGWrr1Rq8Y/PVzu4NgdLVHYJvYzMpTORA/edit?utm_content=DAGWrr1Rq8Y&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

Bitacroa (también la puedes encontrar en el repositorio) - https://docs.google.com/document/d/1jLJkXjLvEbsDaYTUqvG5MCQUBzpc5MmRBsHHOUfCGYQ/edit?usp=sharing

## Detalles del proyecto

### Índices
Los índices se encuentran agregados en la carpeta backend dentro de `src\models\prisma\schema.prisma` y son los siguientes:
```prisma
model Appointment {
  id        Int      @id @default(autoincrement())
  datetime  DateTime
  patient   Patient  @relation(fields: [patientId], references: [id])
  patientId Int
  doctor    Doctor   @relation(fields: [doctorId], references: [id])
  doctorId  Int
  status    AppointmentStatus @default(SCHEDULED)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([doctorId, datetime])
  @@index([patientId])
}
```


### Repositorios
Los Repositioros se encuentran dentro de la carpeta backend dentro de `src\repositories` y son los siguientes:

`appointmentRepository.ts`

`doctorRepository.ts`

`patientRepository.ts`

### Endpoints
Los endopints son los siguientes:
```typescript
http://localhost:3002/api/appointments
http://localhost:3002/api/doctors/available-slots?doctorId=1&date=2024-10-28
http://localhost:3002/api/patients
http://localhost:3002/api/doctors
```

## Testing
### LOS ARCHIVOS EJECUTADOS EN TODAS LAS FASES DEL PROYECTO PARA LOAD Y PROFILING SON LOS MISMSOS.
### Load Testing
Los archivos ejecuados para realizar el load testing se encuentran dentro de la carpeta backend en `\scripts`.

Se ejecutó el script `load-test-get.sh` para realizar las pruebas para endpoints GET con la siguiente configuración:
```bash
DURATION=30
CONNECTIONS=100
PIPELINING=10
BASE_URL="http://localhost:3001"
```

Cada endpoint fue sometido a una carga de 100 conexiones concurrentes con 10 solicitudes en cola por conexión durante 30 segundos.

Se ejecutó el script `load-test-post.js` para realizar las pruebas para endpoints POSTcon la siguiente configuración:

```
const generateWeekAppointments = () => {
    const appointments = [];
    const startDate = new Date('2024-10-18T08:00:00.000Z');
    for (let day = 0; day < 5; day++) {
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
```

Se generaron 40 citas para 5 días laborales con intervalos de una hora.

```
const instance = autocannon({
    url: 'http://localhost:3001/api/appointments',
    connections: 5,
    duration: 30,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(appointments[0]),
    setupClient: (client) => {
        client.on('response', () => {
            currentIndex = (currentIndex + 1) % appointments.length;
            client.setBody(JSON.stringify(appointments[currentIndex]));
        });
    }
});
```

Se probaron 5 conexiones simultáneas durante 30 segundos, con rotación dinámica de los datos enviados.

### Profiling
Se empleó Clinic.js, diseñada para analizar y diagnosticar el rendimiento de aplicaciones Node.js
Los scripts relacionados con el profiling están definidos en la sección "scripts" del `package.json` dentro de la carpeta backend:
```json
"profile:build": "tsc && clinic doctor -- node dist/index.js"
```

Para generar un perfil de rendimiento, se ejecuta el siguiente comando:
```bash
npm run profile:build
```
