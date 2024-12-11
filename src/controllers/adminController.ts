import { AreaModel, StaffAreaModel, StaffModel } from "../prisma";
import { Request, Response } from "express";
import { Staff } from "../utils/interface";
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
                    names: row.names,
                    pole: row.pole,
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
                        await StaffModel.create({
                            data: {
                                names: user.names,
                                role: user.role,
                                pole: user.pole,
                                pseudo,
                            }
                        });
                    }
                }

                fs.unlinkSync(filePath);
                return res.status(200).json({ message: "Data successfully added to the database!" });
            });
    } catch (error) {
        res.status(500).json({ error: "Failed to process file!" });
    }
};

//  STAFF
export const getAllStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const staffData = await StaffModel.findMany();
        res.status(200).json(staffData);
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
        console.error('Erreur lors de la suppression des données :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

export const addStaff = async (req: Request, res: Response): Promise<void> => {
    try {

        const data = req.body;

        if (data) {

            await StaffModel.create({
                data: {
                    pseudo: data.names.replace(" ", "").toLowerCase(),
                    names: data.names,
                    role: data.role,
                    pole: data.pole,
                }
            });
            res.status(200).json({ message: "Membre ajouté avec succès" });

        } else {
            res.status(400).json({ message: 'Les data manquent' });
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}


// AREA

// all-area
export const getAllAreas = async (req: Request, res: Response): Promise<void> => {
    try {
        const areas = await AreaModel.findMany({
            include: {
                staff: {
                    include: {
                        staff: true
                    }
                }
            }
        });
        res.status(200).json(areas);
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// all staff-area
export const getStaffOfAreaById = async (req: Request, res: Response): Promise<void> => {
    try {
        const areaId = req.params.areaId
        if (areaId) {

            const areas = await AreaModel.findUnique({
                where: {
                    id: Number(areaId)
                },
                include: {
                    staff: {
                        include: {
                            staff: true
                        }
                    }
                }
            });
            const staffs = areas?.staff.map((st: any) => st.staff)
            res.status(200).json(staffs);

        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// associate/disossiate
export const associateStaffToArea = async (req: Request, res: Response): Promise<void> => {
    try {

        const data = req.body;
        // console.log(data);

        if (data && data.staff_id && data.area_id && data.action) {

            const staff = await StaffModel.findUnique({
                where: {
                    id: data.staff_id
                },
                include: {
                    areas: true
                }
            });

            if (!staff) {
                res.status(400).json({ ok: false, message: "Utilisateur introuvable" });
            }

            const area = await AreaModel.findUnique({
                where: {
                    id: data.area_id
                }
            });

            if (!area) {
                res.status(400).json({ ok: false, message: "Zone introuvable" });
            }

            const staffIsPermitted = staff?.areas.find((area: any) => area.areaId == data.area_id);
            const isPermitted = staffIsPermitted != null;

            if (data.action == "associate" && !isPermitted) {
                await StaffAreaModel.create({
                    data: {
                        staffId: data.staff_id,
                        areaId: data.area_id
                    }
                });
            } else if (data.action == "dissociate" && isPermitted) {
                await StaffAreaModel.delete({
                    where: {
                        staffId_areaId: {
                            staffId: staffIsPermitted.staffId,
                            areaId: staffIsPermitted.areaId
                        }
                    }
                });
            }

            res.status(200).json({
                ok: true,
            });

        } else {
            res.status(400).json({ ok: false, message: "le corps de la requête n'est pas correcte. staff_id ou area_id est null" });
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}


// CHECK
export const checkQrCode = async (req: Request, res: Response): Promise<void> => {
    try {

        const data = req.body;
        console.log(data);

        if (data && data.staff_id && data.area_id) {

            const staff = await StaffModel.findUnique({
                where: {
                    id: data.staff_id
                },
                include: {
                    areas: true
                }
            });

            if (!staff) {
                res.status(400).json({ ok: false, message: "Utilisateur introuvable" });
            }

            const area = await AreaModel.findUnique({
                where: {
                    id: Number(data.area_id)
                }
            });

            if (!area) {
                res.status(400).json({ ok: false, message: "Zone introuvable" });
            }

            const staffIsPermitted = staff?.areas.find((area: any) => area.areaId == data.area_id);
            const isPermitted = staffIsPermitted != null;

            res.status(200).json({
                isPermitted: isPermitted,
                checkHistory: [],
                user: staff,
                ok: true,
            });

        } else {
            res.status(400).json({ ok: false, message: "le corps de la requête n'est pas correcte. staff_id ou area_id est null" });
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}