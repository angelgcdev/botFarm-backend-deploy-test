-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMINISTRADOR', 'PERSONAL');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('FISICO', 'EMULADOR');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "GoogleAccountStatus" AS ENUM ('ACTIVO', 'INACTIVO', 'BANEADO');

-- CreateEnum
CREATE TYPE "SocialAccountStatus" AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'BANEADO');

-- CreateEnum
CREATE TYPE "InteractionStatus" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'FALLIDA', 'CANCELADO');

-- CreateEnum
CREATE TYPE "HistoryStatus" AS ENUM ('COMPLETADA', 'FALLIDA');

-- CreateEnum
CREATE TYPE "SocialNetworkType" AS ENUM ('TIKTOK', 'FACEBOOK');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "udid" TEXT NOT NULL,
    "device_type" "DeviceType" NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'INACTIVO',
    "os_version" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity" TIMESTAMP(3),
    "complete_config" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_account" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "status" "GoogleAccountStatus" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "google_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_network" (
    "id" SERIAL NOT NULL,
    "name" "SocialNetworkType" NOT NULL,

    CONSTRAINT "social_network_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_network_account" (
    "id" SERIAL NOT NULL,
    "social_network_id" INTEGER NOT NULL,
    "google_account_id" INTEGER NOT NULL,
    "username" TEXT,
    "status" "SocialAccountStatus" NOT NULL DEFAULT 'ACTIVO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_network_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_tiktok_interaction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "video_url" TEXT NOT NULL,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "status" "InteractionStatus" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "scheduled_tiktok_interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_facebook_interaction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "post_url" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "shared_groups_count" INTEGER NOT NULL DEFAULT 0,
    "time_between_posts" INTEGER NOT NULL DEFAULT 0,
    "status" "InteractionStatus" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "scheduled_facebook_interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tiktok_interaction_history" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "username" TEXT,
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "video_saved" BOOLEAN NOT NULL DEFAULT false,
    "commented" TEXT,
    "finished_at" TIMESTAMP(3),
    "video_url" TEXT,
    "status" "HistoryStatus" NOT NULL DEFAULT 'FALLIDA',

    CONSTRAINT "tiktok_interaction_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facebook_interaction_history" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "shared_groups_count" INTEGER NOT NULL DEFAULT 0,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "commented" BOOLEAN NOT NULL DEFAULT false,
    "finished_at" TIMESTAMP(3),
    "status" "HistoryStatus" NOT NULL DEFAULT 'FALLIDA',

    CONSTRAINT "facebook_interaction_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_account" ADD CONSTRAINT "google_account_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_network_account" ADD CONSTRAINT "social_network_account_google_account_id_fkey" FOREIGN KEY ("google_account_id") REFERENCES "google_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_network_account" ADD CONSTRAINT "social_network_account_social_network_id_fkey" FOREIGN KEY ("social_network_id") REFERENCES "social_network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_tiktok_interaction" ADD CONSTRAINT "scheduled_tiktok_interaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_facebook_interaction" ADD CONSTRAINT "scheduled_facebook_interaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiktok_interaction_history" ADD CONSTRAINT "tiktok_interaction_history_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facebook_interaction_history" ADD CONSTRAINT "facebook_interaction_history_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
