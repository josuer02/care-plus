## Información general
### Usted se encuentra en la branch `master`. 
En esta branch se encuentre actualmente el proyecto llevado a cabo en SQL sin indices. 

Para visualizar SQL con índices se puede dirigir al commit de esta branch titulado `Update README` con SHA `b708e16984dce34c1386944e4d3793ce4c69fe2c`

Para visualizar el proyecot migrado a MongoDB (NosSQL) dirijase a la branch titulada `nosql-migration`.

### Bitácora
Usted puede encontrar la bitacora del presente proyecto en el archivo `bitacora.pdf`. En ella encontrará la documentación respectiva y detallada como también presentación y discusión de resultados obtenidos durante las fases de testing.

### Anexos
Load testing - https://docs.google.com/spreadsheets/d/1gMiQwqffgLYEuXyWnOrkMtU7VS-km-hhcN_jmlnfHGQ/edit?usp=sharing

Presentación - https://www.canva.com/design/DAGWrr1Rq8Y/PVzu4NgdLVHYJvYzMpTORA/edit?utm_content=DAGWrr1Rq8Y&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

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
