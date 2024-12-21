import { AreaModel, CheckingModel, DeviceModel, EventModel, StaffAreaModel, StaffModel, UserModel } from "../prisma";
import { hashPassword } from "../helpers/hash";
import { Request, Response } from "express";
import { Staff } from "../utils/interface";
import csvParser from "csv-parser";
const bcrypt = require('bcrypt');
import fs from "fs";
import { generateToken } from "../helpers/jwt";

// AUTH

// add user
export const addUser = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {

        const data = req.body;

        if (data && data.username && data.password && data.fullName) {

            var user = await UserModel.findFirst({
                where: {
                    username: data.username
                }
            });

            if (user) {
                return next(res.status(400).json({ message: "Cet utilisateur existe déja" }));
            }

            const hashedPassword = await hashPassword(data.password);

            user = await UserModel.create({
                data: {
                    username: data.username,
                    fullName: data.fullName,
                    password: hashedPassword,
                }
            });

            return next(res.status(200).json({ message: "Utilisateur ajouté avec succès" }));

        } else {
            return next(res.status(400).json({ message: 'Les datas manquent' }));
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// login
export const login = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {

        const data = req.body;

        if (data && data.username && data.password) {

            var user = await UserModel.findFirst({
                where: {
                    username: data.username
                }
            });

            if (!user) {
                return next(res.status(400).json({ message: "Nom d'utilisateur ou mot de passe incorrect" }));
            }

            const isPasswordValid = await bcrypt.compare(data.password, user?.password);

            if (!isPasswordValid) {
                return next(res.status(400).json({ message: "Nom d'utilisateur ou mot de passe incorrect" }));
            }

            const token = generateToken(user?.id!);
            user = await UserModel.update({
                where: {
                    id: user?.id!
                },
                data: {
                    accessToken: token
                }
            });

            return next(res.status(200).json({
                ok: true,
                user: user
            }));

        } else {
            return next(res.status(400).json({ message: 'Les datas manquent' }));
        }


    } catch (error) {
        console.error("Erreur lors de l'authentification :", error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// EVENT

// add event
export const addEvent = async (req: Request, res: Response, next: Function): Promise<void> => {
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

            return next(res.status(200).json({ message: "Évenement ajoutée avec succès" }));

        } else {
            return next(res.status(400).json({ message: 'Les datas manquent' }));
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// delete event
export const deleteEvent = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {
        const id = req.params.eventId;
        if (id) {

            await EventModel.delete({
                where: {
                    id
                }
            });
            return next(res.status(200).json({ message: "Évenement supprimée" }));

        } else {
            return next(res.status(400).json({ message: 'les datas sont manquantes ou incomplètes' }));
        }
    } catch (error) {
        console.error('Erreur lors de la suppression des données :', error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// get all events
export const getAllEvent = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {

        const eventData = await EventModel.findMany();

        return next(res.status(200).json(eventData));

    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}


//  STAFF

// upload staff list
export const handleFileUploadStaff = async (req: Request, res: Response, next: Function): Promise<void> => {
    if (!req.file) {
        return next(res.status(400).json({ error: "No file uploaded!" }));
    }

    const filePath = req.file?.path;
    const users: Staff[] = [];

    const event_id = req.params.eventId;

    if (!event_id) {
        return next(res.status(400).json({ message: "Vous devez fournir un id d'évenement" }));
    }

    const event = await EventModel.findUnique({
        where: {
            id: event_id,
        },
    });

    if (!event) {
        return next(res.status(400).json({ message: "Cet évenement n'existe pas" }));
    }

    try {
        // Promesse pour lire et traiter le fichier CSV
        await new Promise<void>((resolve, reject) => {

            fs.createReadStream(filePath!)
                .pipe(csvParser())
                .on("data", (row) => {
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
                .on("end", () => {
                    resolve();
                })
                .on("error", (err) => {
                    reject(err);
                });
        });

        // Ajouter les utilisateurs dans la base de données
        for (const user of users) {
            const pseudo: string = user.names.replace(" ", "").toLowerCase();
            const existingStaff = await StaffModel.findFirst({
                where: { pseudo },
            });

            if (!existingStaff) {
                await StaffModel.create({
                    data: {
                        eventId: event_id,
                        names: user.names,
                        role: user.role,
                        pole: user.pole,
                        pseudo,
                    },
                });
            }
        }

        // Supprimer le fichier après traitement
        fs.unlinkSync(filePath!);

        return next(res.status(200).json({ message: "Data successfully added to the database!" }));
    } catch (error) {
        console.error("Error while processing the file:", error);

        return next(res.status(500).json({ error: "Failed to process file!" }));
    }
};

// get all staff
export const getAllStaff = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {

        const event_id = req.params.eventId;

        if (!event_id) {
            return next(res.status(400).json({ message: "vous devez fournir un id d'évenement" }));
        }

        const event = await EventModel.findUnique({
            where: {
                id: event_id
            }
        });

        if (!event) {
            return next(res.status(400).json({ message: "Cet évenement n'existe pas" }));
        }

        const staffData = await StaffModel.findMany({
            where: {
                eventId: event_id
            }
        });

        return next(res.status(200).json(staffData));

    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// delete all staff
export const deleteAllStaff = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {

        const event_id = req.params.eventId;

        if (!event_id) {
            return next(res.status(400).json({ message: "Vous devez fournir un id d'évenement" }));
        }

        const event = await EventModel.findUnique({
            where: {
                id: event_id
            }
        });

        if (!event) {
            return next(res.status(400).json({ message: "Cet évenement n'existe pas" }));
        }

        await StaffModel.deleteMany({
            where: {
                eventId: event_id
            }
        });

        return next(res.status(200).json({ message: "Liste vidée avec succès" }));

    } catch (error) {
        console.error('Erreur lors de la suppression des données :', error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// add staff
export const addStaff = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {

        const data = req.body;

        if (data && data.event_id) {

            const event = await EventModel.findUnique({
                where: {
                    id: data.event_id
                }
            });

            if (!event) {
                return next(res.status(400).json({ message: "Cet évenement n'existe pas" }));
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
            return next(res.status(200).json({ message: "Membre ajouté avec succès" }));

        } else {
            return next(res.status(400).json({ message: 'Les data manquent' }));
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// delete staff
export const deleteStaff = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {
        const id = req.params.staffId;
        if (id) {

            await StaffModel.delete({
                where: {
                    id
                }
            });
            return next(res.status(200).json({ message: "Membre supprimé" }));

        } else {
            return next(res.status(400).json({ message: 'les datas sont manquantes ou incomplètes' }));
        }
    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// DEVICE

// add device
export const addDevice = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {

        const data = req.body;

        if (data && data.device_name && data.device_id && data.area_id) {

            const area = await AreaModel.findUnique({
                where: {
                    id: data.area_id
                }
            });

            if (!area) {
                return next(res.status(400).json({ ok: false, message: "Zone introuvable" }));
            }

            var device = await DeviceModel.findUnique({
                where: {
                    id: data.device_id
                }
            });

            if (device) {
                return next(res.status(400).json({ ok: false, message: "Ce terminal existe déja" }));
            }

            await DeviceModel.create({
                data: {
                    id: data.device_id,
                    areaId: data.area_id,
                    name: data.device_name,
                }
            });

            return next(res.status(200).json({
                message: "Terminal ajouté avec succès",
                zone: area,
            }));

        } else {
            return next(res.status(400).json({ message: 'Les datas manquent' }));
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// delete device
export const deleteDevice = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {
        const id = req.params.deviceId;
        if (id) {

            await DeviceModel.delete({
                where: {
                    id
                }
            });
            return next(res.status(200).json({ message: "Terminal supprimée" }));

        } else {
            return next(res.status(400).json({ message: 'les datas sont manquantes ou incomplètes' }));
        }
    } catch (error) {
        console.error('Erreur lors de la suppression des données :', error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// get state of a device
export const getDeviceState = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {

        const deviceId = req.params.deviceId;

        if (deviceId) {

            const device = await DeviceModel.findUnique({
                where: {
                    id: deviceId
                },
            });

            if (!device) {
                return next(res.status(400).json({ ok: false, message: "Terminal introuvable" }));
            }

            return next(res.status(200).json({
                actif: device?.active,
            }));

        } else {
            return next(res.status(400).json({ ok: false, message: "Le parametre deviceId manque dans la requête" }));
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// enable/disable device
export const toogleEnableDevice = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {

        const data = req.body;

        if (data && data.device_id && data.action) {

            const device = await DeviceModel.findUnique({
                where: {
                    id: data.device_id
                },
            });

            if (!device) {
                return next(res.status(400).json({ ok: false, message: "Utilisateur introuvable" }));
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

            return next(res.status(200).json({
                ok: true,
            }));

        } else {
            return next(res.status(400).json({ ok: false, message: "le corps de la requête n'est pas correcte. device_id ou area_id est null" }));
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}


// AREA

// add area
export const addArea = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {

        const data = req.body;

        if (data && data.label && data.event_id) {

            const event = await EventModel.findUnique({
                where: {
                    id: data.event_id
                }
            });

            if (!event) {
                return next(res.status(400).json({ message: "Cet évenement n'existe pas" }));
            }

            await AreaModel.create({
                data: {
                    label: data.label,
                    eventId: data.event_id
                }
            });

            return next(res.status(200).json({ message: "Zone ajoutée avec succès" }));

        } else {
            return next(res.status(400).json({ message: 'Les datas manquent' }));
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// delete area
export const deleteArea = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {
        const id = req.params.areaId;
        if (id) {

            await AreaModel.delete({
                where: {
                    id
                }
            });
            return next(res.status(200).json({ message: "Zone supprimée" }));

        } else {
            return next(res.status(400).json({ message: 'les datas sont manquantes ou incomplètes' }));
        }
    } catch (error) {
        console.error('Erreur lors de la suppression des données :', error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// all-area
export const getAllAreas = async (req: Request, res: Response, next: Function): Promise<void> => {

    const event_id = req.params.eventId;

    if (!event_id) {
        return next(res.status(400).json({ message: "Vous devez fournir un id d'évenement" }));
    }

    const event = await EventModel.findUnique({
        where: {
            id: event_id
        }
    });

    if (!event) {
        return next(res.status(400).json({ message: "Cet évenement n'existe pas" }));
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
        return next(res.status(200).json(areas));
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// all staff-area
export const getStaffOfAreaById = async (req: Request, res: Response, next: Function): Promise<void> => {
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
            return next(res.status(200).json(staffs));

        } else {
            return next(res.status(400).json({ messgae: "areaId manque" }));
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// all staff-area
export const getDevicesOfAreaById = async (req: Request, res: Response, next: Function): Promise<void> => {
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
            return next(res.status(200).json(devices));

        } else {
            return next(res.status(400).json({ messgae: "areaId manque" }));
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// associate/disossiate
export const associateStaffToArea = async (req: Request, res: Response, next: Function): Promise<void> => {
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
                return next(res.status(400).json({ ok: false, message: "Utilisateur introuvable" }));
            }

            const area = await AreaModel.findUnique({
                where: {
                    id: data.area_id
                }
            });

            if (!area) {
                return next(res.status(400).json({ ok: false, message: "Zone introuvable" }));
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

            return next(res.status(200).json({
                ok: true,
            }));

        } else {
            return next(res.status(400).json({
                ok: false,
                message: "le corps de la requête n'est pas correcte. staff_id ou area_id est null"
            }));
        }


    } catch (error) {
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// CHECKINGS
export const getAllCheckings = async (req: Request, res: Response, next: Function): Promise<void> => {

    const event_id = req.params.eventId;

    if (!event_id) {
        return next(res.status(400).json({ message: "Vous devez fournir un id d'évenement" }));
    }

    const event = await EventModel.findUnique({
        where: {
            id: event_id
        }
    });

    if (!event) {
        return next(res.status(400).json({ message: "Cet évenement n'existe pas" }));
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
        return next(res.status(200).json(checkings));
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}

// CHECK

// check staff appartenance to an area
export const checkStaffQrCode = async (req: Request, res: Response, next: Function): Promise<void> => {
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
                return next(res.status(400).json({ ok: false, message: "Utilisateur introuvable" }));
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
                return next(res.status(400).json({ ok: false, message: "Terminal introuvable ou inactif" }));
            }

            const area = device?.area

            if (!area) {
                return next(res.status(400).json({ ok: false, message: "Zone introuvable" }));
            }

            const staffArea = staff?.areas.find((sArea: any) => sArea.areaId == area?.id);
            const isPermitted = staffArea != null;
            const deviceField = device?.person ? device?.name + " - " + device?.person : device?.name;

            await CheckingModel.create({
                data: {
                    eventId: staff?.eventId,
                    staff: staff?.names!,
                    success: isPermitted,
                    device: deviceField,
                    aera: area?.label!,
                }
            });

            return next(res.status(200).json({
                isPermitted: isPermitted,
                user: staff,
                ok: true,
            }));

        } else {
            return next(res.status(400).json({ ok: false, message: "le corps de la requête n'est pas correcte. staff_id ou device_id est null" }));
        }


    } catch (error) {
        console.error("Erreur lors de l'ajout des données :", error);
        return next(res.status(500).json({ message: 'Erreur interne du serveur' }));
    }
}