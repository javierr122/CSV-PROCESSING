import Link from "next/link";
import { UploadList } from "../../components/UploadList";
import { Button } from "../../components/ui/button";
import { IconUploadCloud } from "../../components/icons";

export default function UploadsPage() {
  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-brand-700 via-brand-600 to-blue-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            Uploads
          </h1>
          <p className="mt-1 text-sm text-gray-500">Todos los archivos CSV subidos al sistema.</p>
        </div>
        <Link href="/uploads/new">
          <Button>
            <IconUploadCloud className="h-4 w-4" />
            Subir archivo
          </Button>
        </Link>
      </div>
      <UploadList />
    </main>
  );
}
