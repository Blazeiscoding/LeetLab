/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- DropForeignKey
ALTER TABLE "Playlist" DROP CONSTRAINT "Playlist_userId_fkey";

-- DropForeignKey
ALTER TABLE "Problem" DROP CONSTRAINT "Problem_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProblemSolved" DROP CONSTRAINT "ProblemSolved_userId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_userId_fkey";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "type" "OtpType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemSolved" ADD CONSTRAINT "ProblemSolved_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
