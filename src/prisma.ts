import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const StaffAreaModel = prisma.staffArea;
export const CheckingModel = prisma.checking;
export const DeviceModel = prisma.device;
export const EventModel = prisma.event;
export const StaffModel = prisma.staff;
export const AreaModel = prisma.area;
export const UserModel = prisma.user;
