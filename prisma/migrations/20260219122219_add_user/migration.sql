-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "imdbID" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "poster" TEXT,
    "year" TEXT,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieCache" (
    "imdbID" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieCache_pkey" PRIMARY KEY ("imdbID")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_imdbID_key" ON "Favorite"("imdbID");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
