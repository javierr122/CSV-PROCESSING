# CSV-PROCESING

Sistema de **procesamiento asíncrono de documentos CSV** desarrollado para la
prueba técnica Full Stack de CarbonBox. Permite subir archivos CSV con datos
de actividad (consumo de electricidad, gas, transporte, agua, residuos),
procesarlos de forma asíncrona con una cola de mensajes, y visualizar los
resultados una vez completado el procesamiento.

---

## 1. Descripción del proyecto

```
1. Usuario sube CSV desde el frontend (Next.js)
2. Backend guarda el archivo en S3/LocalStack (o filesystem local)
3. Backend crea el registro Upload en PostgreSQL (estado PENDING)
4. Backend encola un mensaje en SQS/LocalStack (o mock en memoria)
5. Backend responde de inmediato con el id del upload

   [PROCESAMIENTO ASÍNCRONO]
6. El Worker consume el mensaje de la cola
7. El Worker descarga y parsea el CSV, validando fila por fila
8. El Worker guarda las filas válidas como ActivityData
9. El Worker actualiza el Upload a COMPLETED o FAILED

   [CONSULTA DE RESULTADOS]
10. El frontend hace polling cada 3s mientras el estado es PENDING/PROCESSING
11. Al completar, muestra la tabla de datos procesados
```

Repositorio:

```
CSV-PROCESING/
├── backend/            # API + Worker (Node.js/TypeScript/Fastify/Prisma)
├── frontend/            # Next.js 14 (App Router)
├── docs/
│   └── arquitectura-aws.md   # Diagrama de infraestructura AWS
├── USO-DE-IA.md          # Documentación del uso de IA en esta prueba
└── sample-data.csv        # 60 filas de datos de prueba
```

---

## 2. Requisitos previos

- **Node.js** 20+ y npm
- **Docker** y **Docker Compose** (para PostgreSQL y, opcionalmente, LocalStack)
- Windows: PowerShell con ejecución de scripts habilitada (`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`) o usar `cmd.exe`

---

## 3. Instrucciones de instalación y ejecución

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env
npm run docker:up          # levanta PostgreSQL (+ LocalStack si STORAGE_DRIVER/MESSAGE_QUEUE_DRIVER=s3/sqs)
npm run prisma:migrate       # crea las tablas uploads / activity_data
npm run dev                  # API en http://localhost:3001

# 2. Worker (en otra terminal)
cd backend
npm run worker

# 3. Frontend (en otra terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev                  # http://localhost:3000
```

Cada proyecto trae su propio README con el detalle de cada tecnología, ejemplos
de uso y troubleshooting: [`backend/README.md`](./backend/README.md) y
[`frontend/README.md`](./frontend/README.md).

### Modo simple (sin LocalStack)

Si nunca trabajaste con S3/SQS, en `backend/.env` puedes usar:

```env
STORAGE_DRIVER=local
MESSAGE_QUEUE_DRIVER=mock
```

Con esto el sistema funciona completo sin depender de LocalStack: los
archivos se guardan en `backend/uploads/` y los mensajes viajan por una cola
en memoria. La única condición es correr **API y worker en el mismo proceso
de Node** para compartir la cola en memoria — para desarrollo normal con dos
terminales separadas se recomienda dejar `sqs`/`s3` con LocalStack levantado.

---

## 4. Arquitectura del sistema

### Bounded Context: `document-processing`

- **Aggregate Root:** `Upload` — representa un archivo subido y su ciclo de vida de procesamiento (`PENDING → PROCESSING → COMPLETED | FAILED`)
- **Entidad:** `ActivityData` — una fila válida del CSV, asociada a un `Upload`
- **Value Objects:** `UploadStatus`, `FileName`
- **Repositorios (interfaces en domain, implementación en infrastructure):** `IUploadRepository`, `IActivityDataRepository`

### Clean Architecture (capas)

```
domain/          → Entidades, Value Objects, interfaces de repositorio (sin dependencias externas)
application/      → Commands, Queries, Handlers, Servicios (usa domain, no conoce infrastructure)
infrastructure/    → Prisma, S3/local storage, SQS/mock, DI container
presentation/       → Controllers, Routes (Fastify)
```

La regla de dependencias apunta siempre hacia adentro: `infrastructure` y
`presentation` dependen de `application`, que depende de `domain` — nunca al revés.

### CQRS

Comandos (escritura) y queries (lectura) están completamente separados, cada
uno con su propio objeto + handler, registrados en un `CommandBus`/`QueryBus`
propio (implementación simple en memoria, sin librería externa):

- **Commands:** `CreateUploadCommand`, `ProcessFileCommand`
- **Queries:** `GetUploadByIdQuery`, `ListUploadsQuery`, `GetUploadResultsQuery`

### Either Pattern

Todos los Command/Query Handlers retornan `Either<Error, Result>` en lugar de
lanzar excepciones de negocio. Ver `backend/src/shared/domain/Either.ts` y
ejemplos de uso en el README del backend.

### Diagrama de flujo

Ver [`docs/arquitectura-aws.md`](./docs/arquitectura-aws.md) para el diagrama
completo de despliegue en AWS (VPC, ECS Fargate, RDS, S3, SQS, CloudWatch) y
su correspondencia con el entorno local.

---

## 5. Decisiones técnicas

- **DI manual en lugar de Awilix:** se optó por inyección de dependencias manual vía constructores (`Container` como composition root) en lugar de un framework de DI. Es más explícito de seguir para quien revisa el código y evita una dependencia adicional, al costo de más código boilerplate en `container.ts`.
- **Bus de comandos/queries propio:** en vez de una librería CQRS de terceros, se implementó un `CommandBus`/`QueryBus` mínimo (un `Map` de handlers). Cubre exactamente lo que pide la prueba sin traer una dependencia sobredimensionada.
- **Drivers intercambiables (S3/local, SQS/mock):** tanto el storage como la mensajería están detrás de interfaces (`IFileStorage`, `IMessagePublisher`/`IMessageConsumer`), con dos implementaciones cada una, seleccionables por variable de entorno. Esto permite evaluar el sistema con LocalStack (fiel a AWS) o completamente en memoria/filesystem (sin infraestructura adicional) sin tocar el dominio ni la aplicación.
- **Either sobre try/catch en la capa de aplicación:** los handlers no lanzan excepciones de negocio; retornan `Either`. Los controllers inspeccionan `isLeft()`/`isRight()` y traducen a códigos HTTP. Los errores no esperados (bugs, fallas de infraestructura) sí se dejan subir y los captura el error handler centralizado de Fastify.
- **Filas inválidas no detienen el procesamiento:** si un CSV tiene algunas filas con datos inválidos, el worker guarda las válidas y reporta `failedRows` — el upload completo no falla por una fila mal formada. Solo se marca `FAILED` si el archivo no pudo leerse/parsearse en absoluto.

### Trade-offs considerados

| Decisión | A favor | En contra |
|---|---|---|
| DI manual vs. Awilix | Más simple de leer, menos dependencias | Más código repetitivo al crecer el proyecto |
| Bus CQRS propio vs. librería | Control total, cero dependencias | No tiene middlewares/pipelines listos (logging, validación) que sí trae una librería madura |
| SQS/S3 vía LocalStack | Fiel al comportamiento real de AWS | Requiere Docker corriendo; más lento que el mock |

### Limitaciones conocidas

- No se implementaron tests automatizados (unitarios ni de integración) por prioridad de tiempo — ver sección "Con más tiempo haría" abajo.
- La autenticación no está implementada (se asume un único usuario, `userId = "user-123"`), tal como lo permite el enunciado.
- El retry/backoff exponencial de SQS no está configurado explícitamente (se usa la configuración por defecto de LocalStack); en AWS real se configuraría `maxReceiveCount` + DLQ explícitamente vía Terraform/CDK.
- El polling del frontend es por intervalo fijo (3s) en vez de WebSockets/Server-Sent Events — es la solución más simple y suficiente para el alcance de la prueba.

**Con más tiempo haría:**
- Tests unitarios para `CsvParserService`, los Value Objects y los Command Handlers (mockeando los repositorios).
- Tests de integración del endpoint `POST /api/v1/uploads` con una base de datos de prueba.
- Retry con exponential backoff explícito en el consumidor de SQS.
- Logging estructurado (pino con contexto de `uploadId` en cada línea del worker).

---

## 6. Cómo probarlo

1. Levanta backend (API + worker) y frontend siguiendo el paso 3.
2. Abre `http://localhost:3000`.
3. Click en **"Subir archivo"** → arrastra o selecciona [`sample-data.csv`](./sample-data.csv) (60 filas de ejemplo).
4. Verás la redirección automática a la página de detalle del upload, en estado `PENDING`/`PROCESSING` con la barra de progreso — el frontend hace polling cada 3 segundos.
5. En unos segundos (según qué tan rápido el worker tome el mensaje de la cola) el estado pasa a `COMPLETED` y aparece la tabla con los datos procesados (categoría, cantidad, unidad, fecha).
6. Vuelve al dashboard (`/`) para ver el resumen (total, completados, en proceso, fallidos) o a `/uploads` para ver la lista paginada de todos los uploads.
7. Para probar el caso de error, edita una copia de `sample-data.csv` y deja una fila con `amount` negativo o `date` en formato inválido: esa fila se reportará en `failedRows` pero el resto del archivo se procesa igual.

---

## 7. Uso de IA

Ver [`USO-DE-IA.md`](./USO-DE-IA.md) — documento obligatorio de la prueba técnica.
