import { addStaff, deleteAllStaff, getAllStaff, getAllAreas, handleFileUploadStaff, checkQrCode } from "../controllers/adminController";
import upload from "../middlewares/upload";
import { Router } from "express";

const router = Router();

//
router.post("/excel/staff", upload.single("file"), handleFileUploadStaff);

// staff
router.delete("/staff/delete-all", deleteAllStaff);
router.get("/staff/get-all", getAllStaff);
router.post("/staff/add", addStaff);

// staff
// router.delete("/staff/delete-all", deleteAllStaff);
router.get("/area/get-all", getAllAreas);
// router.post("/staff/add", addStaff);

// check
router.post("/qrcode/check", checkQrCode);

export default router;
