import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const DivisionModel = prisma.division;
export const StaffModel = prisma.staff;