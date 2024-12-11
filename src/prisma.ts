import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const StaffAreaModel = prisma.staffArea;
export const StaffModel = prisma.staff;
export const AreaModel = prisma.area;
;