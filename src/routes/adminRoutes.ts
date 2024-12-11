import { addStaff, deleteAllStaff, getAllStaff, getAllAreas, handleFileUploadStaff, checkQrCode, getStaffOfAreaById, associateStaffToArea, addArea, deleteArea } from "../controllers/adminController";
import upload from "../middlewares/upload";
import { Router } from "express";

const router = Router();

//
router.post("/excel/staff", upload.single("file"), handleFileUploadStaff);

// staff
router.delete("/staff/delete-all", deleteAllStaff);
router.get("/staff/get-all", getAllStaff);
router.post("/staff/add", addStaff);

// area
router.get("/area/get-staff/:areaId", getStaffOfAreaById);
router.post("/area/associate", associateStaffToArea);
router.delete("/area/delete/:areaId", deleteArea);
router.get("/area/get-all", getAllAreas);
router.post("/area/add", addArea);

// check
router.post("/qrcode/check", checkQrCode);

export default router;
