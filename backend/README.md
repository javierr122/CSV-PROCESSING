# CSV-PROCESING · Backend

API + Worker de procesamiento asíncrono de archivos CSV, construidos con
**DDD + Clean Architecture + CQRS + Either pattern**, para la prueba técnica
Full Stack de CarbonBox.

---

## Índice

1. [Tecnologías utilizadas (con ejemplos)](#1-tecnologías-utilizadas-con-ejemplos)
2. [Arquitectura del proyecto](#2-arquitectura-del-proyecto)
3. [Requisitos previos](#3-requisitos-previos)
4. [Paso a paso: levantar en local](#4-paso-a-paso-levantar-en-local)
5. [Endpoints de la API](#5-endpoints-de-la-api)
6. [Variables de entorno](#6-variables-de-entorno)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Tecnologías utilizadas (con ejemplos)

### Node.js + TypeScript

Runtime y lenguaje base. Todo el código está tipado; los `tsconfig.json`
usan `strict: true`.

```ts
// Ejemplo: un Value Object tipado (src/document-processing/domain/value-objects/FileName.ts)
export class FileName extends ValueObject<{ value: string }> {
  static create(raw: string): Either<InvalidFileNameError, FileName> {
    if (!raw.toLowerCase().endsWith(".csv")) {
      return left(new InvalidFileNameError("el archivo debe tener extensión .csv"));
    }
    return right(new FileName({ value: raw }));
  }
}
```

### Fastify (framework HTTP)

Se eligió por su rendimiento y su sistema de plugins. Los endpoints se
registran como rutas simples que delegan en un `Controller`:

```ts
// src/document-processing/presentation/routes/document-processing.routes.ts
app.post("/api/v1/uploads", createUpload.handle);
app.get("/api/v1/uploads", listUploads.handle);
app.get("/api/v1/uploads/:id", getUploadById.handle);
app.get("/api/v1/uploads/:id/results", getUploadResults.handle);
```

`@fastify/multipart` maneja la subida de archivos (`request.file()`),
`@fastify/cors` habilita CORS hacia el frontend, y `@fastify/sensible`
agrega helpers de respuesta HTTP.

### Prisma (ORM) + PostgreSQL

El schema (`prisma/schema.prisma`) define dos modelos, `Upload` y
`ActivityData`, con una relación 1-a-muchos:

```prisma
model Upload {
  id            String   @id @default(uuid())
  fileName      String   @map("file_name")
  status        String   @default("PENDING")
  activityData  ActivityData[]
  // ...
}

model ActivityData {
  id       String  @id @default(uuid())
  uploadId String  @map("upload_id")
  category String
  amount   Float
  unit     String
  date     DateTime
  upload   Upload  @relation(fields: [uploadId], references: [id])
}
```

Ejemplo de uso en un repositorio (`PrismaUploadRepository`):

```ts
await prisma.upload.upsert({
  where: { id: p.id },
  create: { id: p.id, fileName: p.fileName, status: p.status, /* ... */ },
  update: { status: p.status, processedRows: p.processedRows /* ... */ },
});
```

### DDD (Domain-Driven Design)

El bounded context `document-processing` separa:

- **`domain/`** — `Upload` (Aggregate Root), `ActivityData` (Entidad), `UploadStatus`/`FileName` (Value Objects), interfaces de repositorio. **No importa nada de `infrastructure` ni de librerías externas** (ni siquiera Prisma).
- **`application/`** — Commands, Queries, Handlers y servicios (`CsvParserService`). Depende de `domain`, nunca de `infrastructure` directamente (usa las interfaces).
- **`infrastructure/`** — Implementaciones concretas: `PrismaUploadRepository`, `S3FileStorage`, `SqsMessagePublisher`, el contenedor de DI.
- **`presentation/`** — Controllers y rutas Fastify.

### Clean Architecture

La regla de dependencias: las flechas siempre apuntan hacia adentro.

```
presentation → application → domain
infrastructure → application → domain
```

`infrastructure` implementa las interfaces que `domain`/`application`
definen (ej. `IUploadRepository`), nunca al revés — así el dominio no sabe
que existe Prisma, S3 o SQS.

### CQRS (Command Query Responsibility Segregation)

Comandos (escritura) y queries (lectura) están separados en objetos y
handlers distintos, registrados en un bus propio:

```ts
// Command
export class CreateUploadCommand {
  readonly type = "CreateUploadCommand";
  constructor(public readonly fileName: string, public readonly fileContent: Buffer, public readonly userId: string) {}
}

// Query
export class ListUploadsQuery {
  readonly type = "ListUploadsQuery";
  constructor(public readonly page = 1, public readonly limit = 10) {}
}

// Registro en el composition root (container.ts)
this.commandBus.register("CreateUploadCommand", new CreateUploadCommandHandler(...));
this.queryBus.register("ListUploadsQuery", new ListUploadsQueryHandler(...));
```

### Either Pattern

En vez de `try/catch` + `throw` para errores de negocio, cada handler
retorna `Either<Error, Result>`:

```ts
async execute(command: CreateUploadCommand): Promise<Either<CreateUploadError, UploadDto>> {
  const fileNameOrError = FileName.create(command.fileName);
  if (fileNameOrError.isLeft()) {
    return left(fileNameOrError.value); // error de negocio, sin throw
  }
  // ... lógica
  return right(uploadDto);
}
```

Y el controller lo traduce a HTTP:

```ts
const result = await this.container.commandBus.execute(command);
if (result.isLeft()) {
  reply.code(400).send({ message: result.value.message });
  return;
}
reply.code(201).send(result.value);
```

### AWS SQS + S3 (vía LocalStack)

`docker-compose.yml` levanta LocalStack emulando S3 y SQS localmente. El
SDK de AWS se conecta igual que en producción, solo cambiando el
`endpoint`:

```ts
new S3Client({
  region: env.AWS_REGION,
  endpoint: env.AWS_ENDPOINT_URL, // http://localhost:4566 en local
  forcePathStyle: true,
});
```

Si prefieres no levantar LocalStack, `STORAGE_DRIVER=local` y
`MESSAGE_QUEUE_DRIVER=mock` en `.env` activan implementaciones equivalentes
sin infraestructura adicional (ver `IFileStorage`/`LocalFileStorage` y
`MockMessageQueue`).

### Docker + Docker Compose

`docker-compose.yml` define `postgres` (PostgreSQL 16) y `localstack`
(S3+SQS). El `Dockerfile` construye una imagen multi-stage para producción
(`build` compila TypeScript, `runtime` solo corre `dist/`).

---

## 2. Arquitectura del proyecto

```
backend/
├── src/
│   ├── main.ts                          # Bootstrap de la API (Fastify)
│   ├── worker.ts                         # Bootstrap del Worker
│   ├── config/
│   │   └── env.ts                        # Validación de variables de entorno (Zod)
│   ├── shared/                            # Kernel compartido entre bounded contexts
│   │   ├── domain/
│   │   │   ├── Either.ts                  # Patrón Either
│   │   │   ├── AggregateRoot.ts
│   │   │   └── ValueObject.ts
│   │   ├── application/
│   │   │   ├── ICommandHandler.ts / ICommandBus.ts
│   │   │   └── IQueryHandler.ts / IQueryBus.ts
│   │   └── infrastructure/
│   │       ├── http/BaseController.ts + error-handler.plugin.ts
│   │       └── messaging/IMessagePublisher.ts / IMessageConsumer.ts
│   ├── document-processing/                # Bounded Context
│   │   ├── domain/
│   │   │   ├── entities/ (Upload, ActivityData)
│   │   │   ├── value-objects/ (UploadStatus, FileName)
│   │   │   └── repositories/ (IUploadRepository, IActivityDataRepository)
│   │   ├── application/
│   │   │   ├── commands/ (CreateUploadCommand, ProcessFileCommand + handlers)
│   │   │   ├── queries/ (GetUploadById, ListUploads, GetUploadResults + handlers)
│   │   │   ├── services/CsvParserService.ts
│   │   │   └── dtos/UploadDto.ts
│   │   ├── infrastructure/
│   │   │   ├── persistence/ (PrismaUploadRepository, PrismaActivityDataRepository)
│   │   │   ├── storage/ (S3FileStorage, LocalFileStorage)
│   │   │   ├── messaging/ (SqsMessagePublisher/Consumer, MockMessageQueue)
│   │   │   └── dependency-injection/container.ts   # composition root manual
│   │   └── presentation/
│   │       ├── controllers/ (Create/Get/List/GetResults)
│   │       └── routes/document-processing.routes.ts
│   └── workers/
│       └── FileProcessingWorker.ts
├── prisma/schema.prisma
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## 3. Requisitos previos

- Node.js 20 o superior + npm
- Docker y Docker Compose
- (Windows) Si `npm` falla con un error de "ejecución de scripts deshabilitada" en PowerShell, corre una vez: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, o usa `cmd.exe` en su lugar.

---

## 4. Paso a paso: levantar en local

### Paso 1 — Instalar dependencias

```bash
cd backend
npm install
```

### Paso 2 — Variables de entorno

```bash
cp .env.example .env
```

Por defecto usa LocalStack (`STORAGE_DRIVER=s3`, `MESSAGE_QUEUE_DRIVER=sqs`).
Si prefieres no levantar LocalStack, edita `.env` y pon:

```env
STORAGE_DRIVER=local
MESSAGE_QUEUE_DRIVER=mock
```

### Paso 3 — Levantar PostgreSQL (y LocalStack si aplica)

```bash
npm run docker:up
```

Esto levanta el contenedor `csv-processing-postgres` en `localhost:5432` y,
si `docker-compose.yml` incluye el servicio, `csv-processing-localstack` en
`localhost:4566`.

### Paso 4 — Migrar la base de datos

```bash
npm run prisma:migrate
```

Crea las tablas `uploads` y `activity_data` según `prisma/schema.prisma`.

### Paso 5 — Levantar la API

```bash
npm run dev
```

La API queda escuchando en `http://localhost:3001`. Verifica con:

```bash
curl http://localhost:3001/health
# { "status": "ok" }
```

### Paso 6 — Levantar el Worker (en otra terminal)

```bash
npm run worker
```

El worker queda escuchando la cola (SQS/LocalStack o el mock en memoria,
según `MESSAGE_QUEUE_DRIVER`) y procesando cada `Upload` que llegue.

### Paso 7 — Probar con el archivo de ejemplo

```bash
curl -X POST http://localhost:3001/api/v1/uploads \
  -F "file=@../sample-data.csv"
```

Copia el `id` de la respuesta y consulta su estado:

```bash
curl http://localhost:3001/api/v1/uploads/<id>
curl http://localhost:3001/api/v1/uploads/<id>/results
```

---

## 5. Endpoints de la API

| Método | Endpoint | Descripción | Response |
|---|---|---|---|
| POST | `/api/v1/uploads` | Sube un CSV (`multipart/form-data`, campo `file`) y encola su procesamiento | `{ id, fileName, status, createdAt, ... }` |
| GET | `/api/v1/uploads/:id` | Estado y metadata de un upload | `{ id, status, fileName, totalRows, processedRows, failedRows, errorMessage, ... }` |
| GET | `/api/v1/uploads?page=1&limit=10` | Lista paginada de uploads | `{ data: [...], total, page, limit }` |
| GET | `/api/v1/uploads/:id/results` | Datos procesados (`ActivityData`) de un upload | `{ data: [{ category, amount, unit, date }, ...] }` |
| GET | `/health` | Health check | `{ status: "ok" }` |

---

## 6. Variables de entorno

Ver `.env.example` para la lista completa y comentada. Las más relevantes:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión de PostgreSQL |
| `STORAGE_DRIVER` | `s3` (LocalStack) o `local` (filesystem) |
| `MESSAGE_QUEUE_DRIVER` | `sqs` (LocalStack) o `mock` (memoria) |
| `AWS_ENDPOINT_URL` | Endpoint de LocalStack (`http://localhost:4566`); se omite contra AWS real |
| `S3_BUCKET_NAME` / `SQS_QUEUE_URL` | Nombre del bucket / URL de la cola |
| `CORS_ORIGIN` | Origen permitido para el frontend |

---

## 7. Troubleshooting

**`npm install` falla en PowerShell con "execution of scripts is disabled"**
→ Corre `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` en PowerShell, o usa `cmd.exe`.

**El worker no procesa nada**
→ Verifica que `MESSAGE_QUEUE_DRIVER` sea el mismo en la terminal de la API y del worker (si usas `mock`, ambos procesos deben compartir el mismo `Container`, lo cual solo ocurre corriendo API y worker en el mismo proceso; para procesos separados usa `sqs` con LocalStack levantado).

**Error de conexión a PostgreSQL**
→ Confirma que `npm run docker:up` levantó el contenedor (`docker ps`) y que `DATABASE_URL` en `.env` coincide con las credenciales del `docker-compose.yml`.

**Error subiendo a S3/SQS ("ECONNREFUSED" a localhost:4566)**
→ LocalStack no está corriendo, o `STORAGE_DRIVER`/`MESSAGE_QUEUE_DRIVER` están en `s3`/`sqs` sin haber levantado `npm run docker:up`. Cambia a `local`/`mock`, o levanta LocalStack.
