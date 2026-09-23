"use client";

import { useParams } from "next/navigation";
import { UploadDetail } from "../../../components/UploadDetail";

export default function UploadDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <main>
      <UploadDetail id={params.id} />
    </main>
  );
}
