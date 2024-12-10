import { deleteAllStaff, getAllStaff, handleFileUploadDivision, handleFileUploadStaff } from "../controllers/adminController";
import upload from "../middlewares/upload";
import { Router } from "express";

const router = Router();

// File upload route
router.post("/excel/staff", upload.single("file"), handleFileUploadStaff);
router.post("/excel/division", upload.single("file"), handleFileUploadDivision);

//
router.get("/staff/get-all", upload.single("file"), getAllStaff);
router.delete("/staff/delete-all", upload.single("file"), deleteAllStaff);

export default router;
