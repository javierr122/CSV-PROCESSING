import { CsvUploadForm } from "../../components/csv-upload-form";

export default function UploadPage() {
  return (
    <main>
      <h2 className="mb-6 text-lg font-semibold text-gray-900">Subir archivo CSV</h2>
      <CsvUploadForm />
    </main>
  );
}
