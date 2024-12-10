import { Router, Response, Request } from "express";
import archiver from "archiver";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { StaffModel } from "../prisma";

const router = Router();

router.get("/generate-all", async (req: Request, res: Response) => {

    const qrDir = path.join(__dirname, "../../uploads/qrcodes");
    const zipFilePath = path.join(__dirname, "../../uploads/qrcodes.zip");

    // Ensure the directory exists
    if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir);
    }

    try {
        // Generate QR codes for all staff members
        const staffMembers = await StaffModel.findMany({
            include: {
                division: true
            }
        });
        for (const member of staffMembers) {
            const qrName = member.names + "_" + member.division.label + "_" + member.role + "_" + member.id + ".png";
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

        // Add all QR code files to the archive
        fs.readdirSync(qrDir).forEach((file) => {
            archive.file(path.join(qrDir, file), { name: file });
        });

        await archive.finalize();
    } catch (error) {
        console.error("Error generating QR codes or zipping:", error);
        res.status(500).json({ error: "Failed to generate QR codes" });
    }
});

export default router;
