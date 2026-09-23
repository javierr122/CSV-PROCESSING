import Link from "next/link";
import { UploadForm } from "../../../components/UploadForm";
import { IconChevronLeft } from "../../../components/icons";

export default function NewUploadPage() {
  return (
    <main className="mx-auto max-w-xl space-y-6">
      <Link
        href="/uploads"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        <IconChevronLeft className="h-4 w-4" />
        Volver a la lista
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Subir archivo CSV</h1>
        <p className="mt-1 text-sm text-gray-500">
          El archivo se procesará de forma asíncrona una vez subido.
        </p>
      </div>
      <UploadForm />
    </main>
  );
}
