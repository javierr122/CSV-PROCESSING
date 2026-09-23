# CSV-PROCESING · Frontend

Frontend construido con **Next.js 14 (App Router)** para la prueba técnica
Full Stack de CarbonBox: sube archivos CSV, muestra su estado de
procesamiento en tiempo casi real (polling) y los resultados procesados.

---

## Índice

1. [Tecnologías utilizadas (con ejemplos)](#1-tecnologías-utilizadas-con-ejemplos)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Requisitos previos](#3-requisitos-previos)
4. [Paso a paso: levantar en local](#4-paso-a-paso-levantar-en-local)
5. [Páginas y funcionalidades](#5-páginas-y-funcionalidades)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Tecnologías utilizadas (con ejemplos)

### Next.js 14 (App Router) + TypeScript

Cada carpeta bajo `app/` es una ruta. `app/uploads/[id]/page.tsx` es una
ruta dinámica (`/uploads/abc-123`):

```
app/
├── page.tsx                # "/"           → Dashboard
├── uploads/page.tsx         # "/uploads"     → Lista paginada
├── uploads/new/page.tsx      # "/uploads/new"  → Formulario de subida
└── uploads/[id]/page.tsx      # "/uploads/:id"  → Detalle + resultados
```

`layout.tsx` envuelve toda la app con el `<Providers>` (React Query) y el
header común.

### TanStack React Query

Maneja el estado del servidor: cache, loading/error states, y sobre todo el
**polling automático**. `useUpload` (en `lib/hooks/useUploads.ts`)
consulta el estado de un upload y se auto-detiene al llegar a un estado
terminal:

```ts
export function useUpload(id: string) {
  return useQuery({
    queryKey: ["uploads", id],
    queryFn: () => uploadsApi.getById(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // sigue reconsultando cada 3s mientras esté PENDING/PROCESSING
      return status === "PENDING" || status === "PROCESSING" ? 3000 : false;
    },
  });
}
```

Y `useCreateUpload` invalida la cache de la lista tras subir un archivo,
para que `/uploads` se refresque solo:

```ts
export function useCreateUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadsApi.create(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["uploads"] }),
  });
}
```

### Axios

Cliente HTTP centralizado en `lib/api/api-client.ts`, con la URL base leída
de `NEXT_PUBLIC_API_URL`:

```ts
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});

// lib/api/uploadsApi.ts
create: async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post("/api/v1/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
```

### Tailwind CSS

Utilidades directamente en JSX, sin archivos `.css` separados por
componente. Los colores de marca se extienden en `tailwind.config.ts`
(`brand.50` .. `brand.700`), usados por ejemplo en los botones:

```tsx
<button className="bg-brand-600 text-white hover:bg-brand-700 rounded-md px-4 py-2">
  Subir archivo
</button>
```

---

## 2. Estructura del proyecto

```
frontend/
├── app/
│   ├── layout.tsx                 # Layout raíz + Providers (React Query)
│   ├── page.tsx                    # Dashboard ("/")
│   ├── providers.tsx
│   ├── globals.css
│   └── uploads/
│       ├── page.tsx                # Lista de uploads ("/uploads")
│       ├── new/page.tsx             # Formulario de subida ("/uploads/new")
│       └── [id]/page.tsx             # Detalle + resultados ("/uploads/:id")
├── components/
│   ├── Dashboard.tsx
│   ├── UploadForm.tsx               # Drag & drop + selector de archivo
│   ├── UploadList.tsx                # Tabla paginada con badges de estado
│   ├── UploadDetail.tsx
│   ├── ProcessingStatus.tsx           # Barra de progreso
│   ├── ResultsTable.tsx
│   ├── UploadStatusBadge.tsx
│   └── ui/ (button, card, stat-tile)
└── lib/
    ├── api/ (api-client.ts, uploadsApi.ts)
    ├── hooks/ (useUploads.ts, useCreateUpload.ts)
    └── types/upload.types.ts
```

---

## 3. Requisitos previos

- Node.js 20+ y npm
- El **backend corriendo** en `http://localhost:3001` (ver `../backend/README.md`)
- (Windows) Si `npm` falla en PowerShell por política de ejecución: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, o usa `cmd.exe`.

---

## 4. Paso a paso: levantar en local

### Paso 1 — Instalar dependencias

```bash
cd frontend
npm install
```

### Paso 2 — Variables de entorno

```bash
cp .env.example .env.local
```

Por defecto `NEXT_PUBLIC_API_URL=http://localhost:3001` — ajusta si tu
backend corre en otro puerto.

### Paso 3 — Levantar el servidor de desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000`.

> Asegúrate de que el backend (API + worker) ya esté corriendo — ver el
> paso a paso en `../backend/README.md` — de lo contrario verás errores de
> red al cargar el dashboard o subir archivos.

---

## 5. Páginas y funcionalidades

| Ruta | Qué hace |
|---|---|
| `/` (Dashboard) | Resumen: total de uploads, completados, en proceso, fallidos; acceso rápido a subir un archivo |
| `/uploads` | Tabla paginada (10 por página) con nombre, estado (badge de color), fecha y filas procesadas |
| `/uploads/new` | Selector de archivo con drag & drop, valida que sea `.csv`, redirige al detalle tras subir |
| `/uploads/:id` | Info del upload + barra de progreso mientras está `PENDING`/`PROCESSING` (con **polling cada 3s**); al completar muestra la tabla de resultados; si falla, muestra el mensaje de error |

Badges de estado: `PENDING` amarillo, `PROCESSING` azul, `COMPLETED` verde,
`FAILED` rojo (`components/UploadStatusBadge.tsx`).

---

## 6. Troubleshooting

**La página carga pero no aparecen uploads / error de red**
→ Verifica que el backend esté corriendo en el puerto configurado en `NEXT_PUBLIC_API_URL` (por defecto `3001`) y que no haya un error de CORS (el backend debe tener `CORS_ORIGIN=http://localhost:3000`).

**El estado se queda en "Procesando" para siempre**
→ Confirma que el **worker** del backend esté corriendo (`npm run worker` en la carpeta `backend`) — el polling del frontend solo refleja lo que hay en la base de datos, no procesa nada por sí mismo.

**`npm install` falla en PowerShell**
→ `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` en PowerShell, o usa `cmd.exe`.

**El drag & drop no acepta mi archivo**
→ Solo se aceptan archivos con extensión `.csv`; si el nombre no termina en `.csv` el formulario muestra un mensaje de validación y no habilita el botón de subir.
