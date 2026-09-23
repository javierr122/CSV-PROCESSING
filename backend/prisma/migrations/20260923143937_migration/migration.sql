-- CreateTable
CREATE TABLE "uploads" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "user_id" TEXT NOT NULL,
    "total_rows" INTEGER,
    "processed_rows" INTEGER,
    "failed_rows" INTEGER,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_data" (
    "id" TEXT NOT NULL,
    "upload_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_data_upload_id_idx" ON "activity_data"("upload_id");

-- AddForeignKey
ALTER TABLE "activity_data" ADD CONSTRAINT "activity_data_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
