-- CreateTable
CREATE TABLE "InvalidMonth" (
    "id" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvalidMonth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvalidMonth_helperId_month_year_key" ON "InvalidMonth"("helperId", "month", "year");

-- AddForeignKey
ALTER TABLE "InvalidMonth" ADD CONSTRAINT "InvalidMonth_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "helpers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
