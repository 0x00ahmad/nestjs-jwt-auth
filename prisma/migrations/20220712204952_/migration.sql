-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'USER', 'DEBUG');

-- CreateTable
CREATE TABLE "AuthRequest" (
    "id" SERIAL NOT NULL,
    "requestersEmail" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiryTime" TIMESTAMP(3) NOT NULL,
    "isTwoFa" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AuthRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "liveSessions" JSONB[],
    "is2FaVerified" BOOLEAN NOT NULL DEFAULT false,
    "twoFaSecret" TEXT,
    "recoveryKey" TEXT,
    "backupCodes" JSONB,
    "usernameId" TEXT NOT NULL,
    "userType" "UserType" NOT NULL DEFAULT E'USER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthRequest_requestersEmail_key" ON "AuthRequest"("requestersEmail");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_usernameId_key" ON "users"("usernameId");
