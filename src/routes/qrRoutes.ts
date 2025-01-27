import { Router, Response, Request } from "express";
import { AreaModel, StaffModel } from "../prisma";
const { format } = require("@fast-csv/format");
const ExcelJS = require("exceljs");
import archiver from "archiver";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";

const router = Router();

router.get("/generate-all/:eventId", async (req: Request, res: Response) => {

    const qrDir = path.join(__dirname, "../../uploads");
    const zipFilePath = path.join(__dirname, "../../uploads/qrcodes.zip");

    // Ensure the directory exists
    if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir);
    }

    try {
        // Generate QR codes for all staff members
        const staffMembers = await StaffModel.findMany({
            where: {
                eventId: req.params.eventId,
            }
        });
        for (const member of staffMembers) {
            const qrName = member.id + ".png";
            const qrPath = path.join(qrDir, qrName);
            await QRCode.toFile(qrPath, member.id);
        }

        // Create a zip archive
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", () => {
            console.log(`Zip file created with ${archive.pointer()} total bytes`);
            // Send the zip file as a response for download
            res.download(zipFilePath, "qrcodes.zip", (err) => {
                if (err) {
                    console.error("Error sending zip file:", err);
                }
                // Clean up: Remove the zip file and individual QR codes after download
                fs.unlinkSync(zipFilePath);
                fs.rmSync(qrDir, { recursive: true, force: true });
            });
        });

        archive.on("error", (err) => {
            throw err;
        });

        archive.pipe(output);

        fs.readdirSync(qrDir).forEach((file) => {
            archive.file(path.join(qrDir, file), { name: file });
        });

        await archive.finalize();
    } catch (error) {
        console.error("Error generating QR codes or zipping:", error);
        res.status(500).json({ error: "Failed to generate QR codes" });
    }

});

router.get("/get-one/:staffId", async (req: Request, res: Response): Promise<void> => {
    try {
        const memberId = req.params.staffId;

        if (!memberId) {
            res.status(400).json({ error: "Staff ID is required" });
            return;
        }

        const member = await StaffModel.findUnique({
            where: { id: memberId },
        });

        if (!member) {
            res.status(404).json({ error: "Staff member not found" });
            return;
        }

        // Générer le QR code en base64
        const qrCodeBase64 = await QRCode.toDataURL(member.id, { width: 200 });

        // Renvoyer la page HTML avec le QR code
        res.status(200).json(qrCodeBase64);
    } catch (error) {
        console.error("Error generating QR code:", error);
        res.status(500).json({ error: "Failed to generate QR code" });
    }
});

router.get("/area/get-one/:areaId", async (req: Request, res: Response): Promise<void> => {
    try {
        const areaId = req.params.areaId;

        if (!areaId) {
            res.status(400).json({ error: "Aread ID is required" });
            return;
        }

        const area = await AreaModel.findUnique({
            where: { id: areaId },
        });

        if (!area) {
            res.status(404).json({ error: "Area area not found" });
            return;
        }

        // Générer le QR code en base64
        const qrCodeBase64 = await QRCode.toDataURL(area.id);

        // Renvoyer la page HTML avec le QR code
        res.status(200).json(qrCodeBase64);
    } catch (error) {
        console.error("Error generating QR code:", error);
        res.status(500).json({ error: "Failed to generate QR code" });
    }
});

router.get("/generate-one/:staffId", async (req: Request, res: Response): Promise<void> => {
    try {
        const memberId = req.params.staffId;

        if (!memberId) {
            res.status(400).json({ error: "Staff ID is required" });
            return;
        }

        const member = await StaffModel.findUnique({
            where: { id: memberId },
        });

        if (!member) {
            res.status(404).json({ error: "Staff member not found" });
            return;
        }

        const qrName = `${member.names}_${member.pole}_${member.role}_${member.id}.png`;
        const qrDir = path.join(__dirname, "../../uploads");


        // Assurez-vous que le répertoire 'uploads' existe
        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir, { recursive: true });
        }

        const qrPath = path.join(qrDir, qrName);

        await QRCode.toFile(qrPath, member.id);

        res.download(qrPath, qrName, (err) => {
            if (err) {
                console.error("Error sending QR code file:", err);
                res.status(500).json({ error: "Failed to download QR code" });
            }
            fs.unlinkSync(qrPath);
        });
    } catch (error) {
        console.error("Error generating QR code:", error);
        res.status(500).json({ error: "Failed to generate QR code" });
    }

});

// router.get("/download-all-csv/:eventId", async (req: Request, res: Response) => {

//     try {

//         const uploadsDir = path.join(__dirname, "../../uploads");

//         if (!fs.existsSync(uploadsDir)) {
//             fs.mkdirSync(uploadsDir);
//         }

//         const staffMembers = await StaffModel.findMany({
//             where: {
//                 eventId: req.params.eventId,
//             }, include: {
//                 areas: true
//             }
//         });

//         const allAreas = await AreaModel.findMany();

//         const filePath = path.join(__dirname, "../../uploads/data.csv");

//         const writeStream = fs.createWriteStream(filePath, { encoding: "utf8" });
//         writeStream.write("\uFEFF");

//         // Mapping des données avec des en-têtes personnalisés

//         const formattedData = staffMembers.map((row) => {
//             var theRow = {
//                 "NOMS": row.names,
//                 "FONCTION": row.role,
//                 "POLE": row.pole,
//                 "QRCODE": "/Volumes/UFO.EXTREME/HIMRA CS2/BADGE OFFICIELS/qrcodes/" + row.id + ".png",
//             };

//             // allAreas.forEach((area) => {
//             //     const existingArea = row.areas.filter((ar) => ar.areaId == area.id);
//             //     theRow = {
//             //         ...theRow,
//             //         [`${area.label}`]: existingArea && existingArea[0] ? 1 : 0
//             //     }

//             // });

//             return theRow;
//         });

//         // Création du fichier CSV avec fast-csv
//         const csvStream = format({ headers: true, delimiter: ";" }); // Séparateur ";"
//         csvStream.pipe(writeStream);
//         formattedData.forEach((row) => csvStream.write(row));
//         csvStream.end();

//         writeStream.on("finish", () => {
//             // Envoie le fichier au client
//             res.download(filePath, "LISTE.csv", (err) => {
//                 if (err) {
//                     console.error("Erreur lors du téléchargement :", err);
//                     res.status(500).send("Erreur lors de la génération du fichier CSV.");
//                 }
//                 // Supprime le fichier temporaire après téléchargement
//                 fs.unlinkSync(filePath);
//             });
//         });
//     } catch (error) {
//         console.error("Erreur :", error);
//         res.status(500).send("Erreur lors de la génération du fichier CSV.");
//     }

// });

router.get("/download-all-csv/:eventId", async (req: Request, res: Response) => {

    try {
        const uploadsDir = path.join(__dirname, "../../uploads");

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }

        const staffMembers = await StaffModel.findMany({
            where: {
                eventId: req.params.eventId,
            },
            include: {
                areas: true,
            },
        });

        const allAreas = await AreaModel.findMany();

        const filePath = path.join(__dirname, "../../uploads/data.xlsx");

        // Créer un workbook et une worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Liste");

        // Ajouter des en-têtes
        const headers = ["NOMS", "FONCTION", "POLE", "QRCODE"
            // , ...allAreas.map((area) => area.label)
        ];
        worksheet.addRow(headers);

        // Ajouter les données
        const promises = staffMembers.map(async (row) => {
            const qrCodePath = path.join(__dirname, "../../qrcodes", `${row.id}.png`);

            // Générer le QR code si le fichier n'existe pas
            if (!fs.existsSync(qrCodePath)) {
                await QRCode.toFile(qrCodePath, row.id, {
                    width: 200, // Largeur/hauteur du QR code
                });
            }

            return {
                row,
                qrCodePath,
            };
        });

        const results = await Promise.all(promises);

        results.forEach(({ row, qrCodePath }) => {
            const rowData = [
                row.names,
                row.role,
                row.pole,
                "/Volumes/UFO.EXTREME/HIMRA CS2/BADGE OFFICIELS/qrcodes/" + row.id + ".png",
                // ...allAreas.map((area) => (row.areas.some((ar) => ar.areaId === area.id) ? 1 : 0)),
            ];

            const excelRow = worksheet.addRow(rowData);

        });

        // Sauvegarder le fichier
        await workbook.xlsx.writeFile(filePath);

        // Envoie le fichier au client
        res.download(filePath, "LISTE.xlsx", (err) => {
            if (err) {
                console.error("Erreur lors du téléchargement :", err);
                res.status(500).send("Erreur lors de la génération du fichier Excel.");
            }
            // Supprime le fichier temporaire après téléchargement
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error("Erreur :", error);
        res.status(500).send("Erreur lors de la génération du fichier Excel.");
    }

});


export default router;
