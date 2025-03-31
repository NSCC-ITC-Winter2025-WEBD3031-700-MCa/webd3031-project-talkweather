-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "temperature" TEXT,
ADD COLUMN     "weatherCode" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';
