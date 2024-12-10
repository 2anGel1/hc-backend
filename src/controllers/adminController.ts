import { DivisionModel, StaffModel } from "../prisma";
import { Division, Staff } from "../utils/interface";
import { Request, Response } from "express";
import csvParser from "csv-parser";
import fs from "fs";

// Handle staff file upload
export const handleFileUploadStaff = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: "No file uploaded!" });
        return;
    }

    const filePath = req.file.path;
    const users: Staff[] = [];

    try {
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", async (row) => {

                users.push({
                    divisionLabel: row.division,
                    names: row.names,
                    role: row.role,
                });

            })
            .on("end", async () => {

                for (const user of users) {

                    const pseudo: string = user.names.replace(" ", "").toLowerCase();
                    const existingStaff = await StaffModel.findFirst({
                        where: { pseudo }
                    });

                    if (!existingStaff) {
                        const division = await DivisionModel.findFirst({
                            where: {
                                label: user.divisionLabel
                            }
                        });

                        if (division) {
                            await StaffModel.create({
                                data: {
                                    divisionId: division.id,
                                    names: user.names,
                                    role: user.role,
                                    pseudo,
                                }
                            })
                        }
                    }
                }

                fs.unlinkSync(filePath);
                return res.status(200).json({ message: "Data successfully added to the database!" });
            });
    } catch (error) {
        res.status(500).json({ error: "Failed to process file!" });
    }
};

// Handle division file upload
export const handleFileUploadDivision = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: "No file uploaded!" });
        return;
    }

    const filePath = req.file.path;
    const divisions: Division[] = [];

    try {
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (row) => {
                divisions.push({ label: row.label });
            })
            .on("end", async () => {

                for (const division of divisions) {

                    const pseudo = division.label.replace(" ", "").toLowerCase();
                    const existingDivison = await DivisionModel.findFirst({
                        where: { pseudo }
                    });
                    if (!existingDivison) {
                        await DivisionModel.create({
                            data: {
                                label: division.label,
                                pseudo
                            }
                        });
                    }

                }

                fs.unlinkSync(filePath);
                res.status(200).json({ message: "Data successfully added to the database!" });
            });
    } catch (error) {
        res.status(500).json({ error: "Failed to process file!" });
    }
};

// 
export const getAllStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const staffData = await StaffModel.findMany({
            include: {
                division: true
            }
        })
        res.status(200).json(staffData); // Retourner les données au format JSON
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

export const deleteAllStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        await StaffModel.deleteMany();
        res.status(200).json({ message: "Liste vidée avec succès" });
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}
