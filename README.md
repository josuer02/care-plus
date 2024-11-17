## Información general
### Usted se encuentra en la branch `nosql-migration`. 
En esta branch se encuentra actualmente el proyecto llevado a cabo en NoSQL con MongoDB. 

Para visualizar SQL con índices se puede dirigir al commit de la branch `master` titulado `Update README` con SHA `b708e16984dce34c1386944e4d3793ce4c69fe2c`

La bitácora, evaluación y discusión de resultados del proyecto en general los encnontrará en dicha branch.

En esta branch `nosql-migration` el codigo fue reutilizado y no hubo cambios singificativos, más que en `src\models\prisma\schema.prisma` y el archivo `docker-compose.yml`. Ambos dentro de la carpeta backend.

## Detalles del proyecto

### Índices
Los índices se encuentran agregados en la carpeta backend dentro de `src\models\prisma\schema.prisma` y son los siguientes:
```prisma
model Appointment {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  datetime  DateTime
  patient   Patient   @relation(fields: [patientId], references: [id])
  patientId String    @db.ObjectId
  doctor    Doctor    @relation(fields: [doctorId], references: [id])
  doctorId  String    @db.ObjectId
  status    AppointmentStatus @default(SCHEDULED)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([status])
  @@index([datetime, status])
  @@index([patientId, status])
  @@index([doctorId, status, datetime])
}
```
