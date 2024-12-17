import {
    handleFileUploadStaff,
    getDevicesOfAreaById,
    associateStaffToArea,
    getStaffOfAreaById,
    toogleEnableDevice,
    checkStaffQrCode,
    getAllCheckings,
    deleteAllStaff,
    getDeviceState,
    getAllStaff,
    getAllAreas,
    deleteStaff,
    getAllEvent,
    deleteEvent,
    deleteArea,
    addDevice,
    addEvent,
    addStaff,
    addArea,
} from "../controllers/adminController";
import upload from "../middlewares/upload";
import { Router } from "express";

const router = Router();

// event
router.delete("/event/delete/:eventId", deleteEvent);
router.get("/event/get-all", getAllEvent);
router.post("/event/add", addEvent);

// staff
router.post("/excel/staff/:eventId", upload.single("file"), handleFileUploadStaff);
router.delete("/staff/delete-all/:eventId", deleteAllStaff);
router.get("/staff/get-all/:eventId", getAllStaff);
router.delete("/staff/delete/:staffId", deleteStaff);
router.post("/staff/add", addStaff);

// area
router.get("/area/get-device/:areaId", getDevicesOfAreaById);
router.get("/area/get-staff/:areaId", getStaffOfAreaById);
router.post("/area/associate", associateStaffToArea);
router.delete("/area/delete/:areaId", deleteArea);
router.get("/area/get-all/:eventId", getAllAreas);
router.post("/area/add", addArea);

//device
router.get("/device/state/:deviceId", getDeviceState);
router.post("/device/toogle", toogleEnableDevice);
router.post("/device/add", addDevice);

//checkings
router.get("/checkings/get-all/:eventId", getAllCheckings);

// check
router.post("/qrcode/check", checkStaffQrCode);

export default router;
