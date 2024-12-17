import { AreaModel, CheckingModel, DeviceModel, EventModel, StaffAreaModel, StaffModel } from "../prisma";
import { Request, Response } from "express";
import { Staff } from "../utils/interface";
import csvParser from "csv-parser";
import fs from "fs";

// EVENT

// add event
export const addEvent = async (req: Request, res: Response): Promise<void> => {
    try {

        const data = req.body;

        if (data && data.label && data.date && data.cover) {

            await EventModel.create({
                data: {
                    label: data.label,
                    cover: data.cover,
                    date: new Date(data.date),
                }
            });

            res.status(200).json({ message: "Évenement ajoutée avec succès" });

        } else {
            res.status(400).json({ message: 'Les datas manquent' });
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// delete event
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.eventId;
        if (id) {

            await EventModel.delete({
                where: {
                    id
                }
            });
            res.status(200).json({ message: "Évenement supprimée" });

        } else {
            res.status(400).json({ message: 'les datas sont manquantes ou incomplètes' });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression des données :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// get all events
export const getAllEvent = async (req: Request, res: Response): Promise<void> => {
    try {

        const eventData = await EventModel.findMany();

        res.status(200).json(eventData);

    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}


//  STAFF

// upload staff list
export const handleFileUploadStaff = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: "No file uploaded!" });
        return;
    }

    const filePath = req.file.path;
    const users: Staff[] = [];

    const event_id = req.params.eventId;

    if (!event_id) {
        res.status(400).json({ message: "vous devez fournir un id d'évenement" });
    }

    const event = await EventModel.findUnique({
        where: {
            id: event_id
        }
    });

    if (!event) {
        res.status(400).json({ message: "Cet évenement n'existe pas" });
    }

    try {
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", async (row) => {

                const ff = Object.values(row)[0];
                if (ff && ff.toString() != "\n") {
                    const gg = ff.toString().split(";");
                    users.push({
                        names: gg[0],
                        role: gg[1],
                        pole: gg[2],

                    });
                }

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
                                eventId: event_id,
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

// get all staff
export const getAllStaff = async (req: Request, res: Response): Promise<void> => {
    try {

        const event_id = req.params.eventId;

        if (!event_id) {
            res.status(400).json({ message: "vous devez fournir un id d'évenement" });
        }

        const event = await EventModel.findUnique({
            where: {
                id: event_id
            }
        });

        if (!event) {
            res.status(400).json({ message: "Cet évenement n'existe pas" });
        }

        const staffData = await StaffModel.findMany({
            where: {
                eventId: event_id
            }
        });

        res.status(200).json(staffData);

    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// delete all staff
export const deleteAllStaff = async (req: Request, res: Response): Promise<void> => {
    try {

        const event_id = req.params.eventId;

        if (!event_id) {
            res.status(400).json({ message: "Vous devez fournir un id d'évenement" });
        }

        const event = await EventModel.findUnique({
            where: {
                id: event_id
            }
        });

        if (!event) {
            res.status(400).json({ message: "Cet évenement n'existe pas" });
        }

        await StaffModel.deleteMany({
            where: {
                eventId: event_id
            }
        });

        res.status(200).json({ message: "Liste vidée avec succès" });

    } catch (error) {
        console.error('Erreur lors de la suppression des données :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// add staff
export const addStaff = async (req: Request, res: Response): Promise<void> => {
    try {

        const data = req.body;

        if (data && data.event_id) {

            const event = await EventModel.findUnique({
                where: {
                    id: data.event_id
                }
            });

            if (!event) {
                res.status(400).json({ message: "Cet évenement n'existe pas" });
            }

            await StaffModel.create({
                data: {
                    pseudo: data.names.replace(" ", "").toLowerCase(),
                    eventId: data.event_id,
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

// delete staff
export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.staffId;
        if (id) {

            await StaffModel.delete({
                where: {
                    id
                }
            });
            res.status(200).json({ message: "Membre supprimé" });

        } else {
            res.status(400).json({ message: 'les datas sont manquantes ou incomplètes' });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// DEVICE

// add device
export const addDevice = async (req: Request, res: Response): Promise<void> => {
    try {

        const data = req.body;

        if (data && data.device_id && data.area_id) {

            const area = await AreaModel.findUnique({
                where: {
                    id: data.area_id
                }
            });

            if (!area) {
                res.status(400).json({ ok: false, message: "Zone introuvable" });
            }

            var device = await DeviceModel.findUnique({
                where: {
                    id: data.device_id
                }
            });

            if (device) {
                res.status(400).json({ ok: false, message: "Ce terminal existe déja" });
            }

            await DeviceModel.create({
                data: {
                    id: data.device_id,
                    areaId: data.area_id
                }
            });

            res.status(200).json({
                message: "Terminal ajouté avec succès",
                zone: area,
            });

        } else {
            res.status(400).json({ message: 'Les datas manquent' });
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// get state of a device
export const getDeviceState = async (req: Request, res: Response): Promise<void> => {
    try {

        const deviceId = req.params.deviceId;

        if (deviceId) {

            const device = await DeviceModel.findUnique({
                where: {
                    id: deviceId
                },
            });

            if (!device) {
                res.status(400).json({ ok: false, message: "Terminal introuvable" });
            }

            res.status(200).json({
                actif: device?.active,
            });

        } else {
            res.status(400).json({ ok: false, message: "Le parametre deviceId manque dans la requête" });
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// enable/disable device
export const toogleEnableDevice = async (req: Request, res: Response): Promise<void> => {
    try {

        const data = req.body;

        if (data && data.device_id && data.action) {

            const device = await DeviceModel.findUnique({
                where: {
                    id: data.device_id
                },
            });

            if (!device) {
                res.status(400).json({ ok: false, message: "Utilisateur introuvable" });
            }

            const active: boolean = data.action == "enable";

            await DeviceModel.update({
                where: {
                    id: device?.id
                },
                data: {
                    active: active
                }
            })

            res.status(200).json({
                ok: true,
            });

        } else {
            res.status(400).json({ ok: false, message: "le corps de la requête n'est pas correcte. device_id ou area_id est null" });
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}


// AREA

// add area
export const addArea = async (req: Request, res: Response): Promise<void> => {
    try {

        const data = req.body;

        if (data && data.label && data.event_id) {

            const event = await EventModel.findUnique({
                where: {
                    id: data.event_id
                }
            });

            if (!event) {
                res.status(400).json({ message: "Cet évenement n'existe pas" });
            }

            await AreaModel.create({
                data: {
                    label: data.label,
                    eventId: data.event_id
                }
            });

            res.status(200).json({ message: "Zone ajoutée avec succès" });

        } else {
            res.status(400).json({ message: 'Les datas manquent' });
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// delete area
export const deleteArea = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.areaId;
        if (id) {

            await AreaModel.delete({
                where: {
                    id
                }
            });
            res.status(200).json({ message: "Zone supprimée" });

        } else {
            res.status(400).json({ message: 'les datas sont manquantes ou incomplètes' });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression des données :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// all-area
export const getAllAreas = async (req: Request, res: Response): Promise<void> => {

    const event_id = req.params.eventId;

    if (!event_id) {
        res.status(400).json({ message: "Vous devez fournir un id d'évenement" });
    }

    const event = await EventModel.findUnique({
        where: {
            id: event_id
        }
    });

    if (!event) {
        res.status(400).json({ message: "Cet évenement n'existe pas" });
    }

    try {
        const areas = await AreaModel.findMany({
            where: {
                eventId: event_id
            },
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
                    id: areaId
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

// all staff-area
export const getDevicesOfAreaById = async (req: Request, res: Response): Promise<void> => {
    try {
        const areaId = req.params.areaId
        if (areaId) {

            const area = await AreaModel.findUnique({
                where: {
                    id: areaId
                },
                include: {
                    devices: true
                }
            });

            const devices = area?.devices
            res.status(200).json(devices);

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

// CHECKINGS
export const getAllCheckings = async (req: Request, res: Response): Promise<void> => {

    const event_id = req.params.eventId;

    if (!event_id) {
        res.status(400).json({ message: "Vous devez fournir un id d'évenement" });
    }

    const event = await EventModel.findUnique({
        where: {
            id: event_id
        }
    });

    if (!event) {
        res.status(400).json({ message: "Cet évenement n'existe pas" });
    }

    try {
        const checkings = await CheckingModel.findMany({
            where: {
                eventId: event_id
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json(checkings);
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

// CHECK

// check staff appartenance to an area
export const checkStaffQrCode = async (req: Request, res: Response): Promise<void> => {
    try {

        const data = req.body;

        if (data && data.staff_id && data.device_id) {

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

            const device = await DeviceModel.findUnique({
                where: {
                    id: data.device_id,
                    active: true,
                },
                include: {
                    area: true
                }
            });

            if (!device || !device.active) {
                res.status(400).json({ ok: false, message: "Terminal introuvable ou inactif" });
            }

            const area = device?.area

            if (!area) {
                res.status(400).json({ ok: false, message: "Zone introuvable" });
            }

            const staffArea = staff?.areas.find((sArea: any) => sArea.areaId == area?.id);
            const isPermitted = staffArea != null;

            await CheckingModel.create({
                data: {
                    eventId: staff?.eventId,
                    staff: staff?.names!,
                    success: isPermitted,
                    aera: area?.label!,
                    device: device?.id!,
                }
            });

            res.status(200).json({
                isPermitted: isPermitted,
                user: staff,
                ok: true,
            });

        } else {
            res.status(400).json({ ok: false, message: "le corps de la requête n'est pas correcte. staff_id ou device_id est null" });
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}