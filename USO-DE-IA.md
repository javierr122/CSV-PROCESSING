# Uso de Inteligencia Artificial en esta Prueba

## Herramientas Utilizadas

- [x] Claude Code (Cowork / claude.ai) — usada como par de desarrollo para prácticamente todo el proyecto
- [ ] GitHub Copilot
- [ ] ChatGPT
- [ ] Cursor AI
- [ ] Otra: ___________

## ¿Qué Generé con IA?

### Backend

- [x] Estructura completa de carpetas siguiendo DDD + Clean Architecture (`domain/`, `application/`, `infrastructure/`, `presentation/`, `shared/`)
- [x] Schema de Prisma (`Upload`, `ActivityData`) a partir del schema mínimo propuesto en el enunciado
- [x] Entidades y Value Objects (`Upload`, `ActivityData`, `UploadStatus`, `FileName`)
- [x] Implementación del patrón Either (`shared/domain/Either.ts`) y su uso en todos los Command/Query Handlers
- [x] CQRS: Commands (`CreateUploadCommand`, `ProcessFileCommand`) y Queries (`GetUploadByIdQuery`, `ListUploadsQuery`, `GetUploadResultsQuery`) con sus handlers y un `CommandBus`/`QueryBus` propio
- [x] Lógica de parseo y validación de CSV (`CsvParserService`)
- [x] Adaptadores de S3/SQS (vía LocalStack) y sus alternativas mock (`LocalFileStorage`, `MockMessageQueue`)
- [x] Worker de procesamiento (`FileProcessingWorker`)
- [x] Configuración de TypeScript, Docker Compose, Dockerfile

### Frontend

- [x] Setup inicial de Next.js 14 (App Router) + Tailwind CSS
- [x] Componentes: `UploadForm` (drag & drop), `UploadList` (tabla paginada), `UploadDetail`, `ProcessingStatus`, `ResultsTable`, `Dashboard`
- [x] Hooks de React Query (`useUploads`, `useUpload`, `useCreateUpload`, `useUploadResults`), incluyendo el polling automático cada 3 segundos
- [x] Cliente Axios (`api-client.ts`, `uploadsApi.ts`)
- [x] Estilos con Tailwind CSS

## ¿Qué Modifiqué o Corregí?

1. **Formato de endpoints y respuestas:**
   La estructura inicial que generé usaba nombres de endpoint y forma de
   respuesta distintos (`/csv-files` en vez de `/api/v1/uploads`, sin
   paginación `{ data, total, page, limit }`). Tuve que revisar el enunciado
   línea por línea y reescribir controllers, rutas y DTOs para que coincidieran
   exactamente con la tabla de endpoints pedida, incluyendo el endpoint
   `GET /api/v1/uploads/:id/results` que no estaba en la primera versión.

2. **Either pattern:**
   La primera versión de los handlers usaba `try/catch` + `throw` (estilo
   más "clásico" de Node). La reescribí para que cada handler retorne
   `Either<Error, Result>` de forma consistente, y adapté los controllers
   para inspeccionar `isLeft()/isRight()` en vez de depender de un
   `try/catch` alrededor de cada llamada.

3. **Modelo de datos:**
   El primer modelo que generé (`CsvFile` con solo `rowCount`) no capturaba
   los datos de negocio reales (categoría, cantidad, unidad, fecha). Lo
   reemplacé por el modelo `Upload` + `ActivityData` tal como lo pide el
   schema Prisma del enunciado, y reescribí el parser de CSV para que
   valide cada columna (`category` no vacío, `amount` positivo, `unit` no
   vacío, `date` en formato `YYYY-MM-DD`) y reporte filas inválidas sin
   detener el procesamiento completo del archivo.

4. **Drivers intercambiables para Storage/Mensajería:**
   Agregué manualmente la capa de abstracción (`IFileStorage`,
   `IMessagePublisher`/`IMessageConsumer`) con dos implementaciones cada
   una (S3/SQS reales vía LocalStack, y alternativas mock en filesystem/
   memoria) para que el proyecto sea evaluable con o sin LocalStack
   corriendo, según lo que sugiere el enunciado ("Opción A" / "Opción B").

## ¿Qué Aprendí?

1. **Patrón Either:**
   No es un patrón que usara antes en TypeScript "puro" (sin una librería
   como `fp-ts`). Entendí que la clave es que el *tipo* de retorno obliga a
   quien llama a manejar el caso de error explícitamente, en vez de confiar
   en que alguien pondrá un `try/catch` en el lugar correcto.

2. **CQRS con bus de comandos/queries:**
   Entendí que la parte esencial de CQRS no es necesariamente una librería
   compleja, sino la separación estricta entre "operaciones que escriben"
   (commands) y "operaciones que leen" (queries), cada una con su propio
   objeto de entrada y su propio handler. Un `Map<string, Handler>` simple
   ya resuelve el enrutamiento sin necesidad de un framework.

3. **React Query (staleTime, refetchInterval):**
   Aprendí a usar `refetchInterval` como una función dinámica que lee el
   estado actual de los datos (`query.state.data?.status`) para decidir si
   seguir haciendo polling o detenerse al llegar a un estado terminal — en
   vez de un `setInterval` manual con `useEffect`.

4. **LocalStack:**
   Entendí que LocalStack expone los mismos endpoints que AWS real,
   solo cambiando el `endpoint`/credenciales del SDK (`AWS_ENDPOINT_URL`),
   lo que permite escribir el código de infraestructura (`S3FileStorage`,
   `SqsMessagePublisher`) exactamente igual a como se usaría contra AWS.

## Limitaciones Encontradas con IA

1. **Estructura DDD completa "de memoria":**
   La primera propuesta de estructura de carpetas era razonable pero no
   coincidía exactamente con la que pide el enunciado (nombres de carpetas,
   ubicación de `dependency-injection/`, etc.). Tuve que comparar
   explícitamente contra la estructura del documento de la prueba y pedir
   ajustes puntuales.

2. **Verificación de compilación:**
   El entorno donde se generó el código no tuvo acceso completo al
   registro de npm para instalar todas las dependencias y correr
   `tsc --noEmit` de punta a punta, así que la verificación final de tipos
   se hizo por revisión manual de imports y firmas en vez de una
   compilación real. **Recomendación:** al levantar el proyecto por primera
   vez, correr `npm run build` en el backend y `npm run build` en el
   frontend antes de dar por bueno el código, y reportar cualquier error de
   tipos que aparezca.

3. **Mensajería y Either combinados:**
   Combinar el patrón Either con un worker que consume mensajes de una cola
   (donde no hay "quién" reciba el `Either` de vuelta, solo logs) requirió
   decidir manualmente qué hacer cuando `ProcessFileCommandHandler` retorna
   `Either.left` dentro del worker — se optó por loguear el error y seguir
   escuchando la cola, en vez de detener el proceso completo.

## Tiempo Invertido (aproximado)

- Definición de arquitectura y estructura de carpetas: 30 min
- Backend (dominio, aplicación, infraestructura, presentación): 2 horas
- Frontend (rutas, componentes, hooks de React Query): 1 hora
- Documentación (READMEs, diagrama AWS, este documento): 30 min
- **Total:** ~4 horas
