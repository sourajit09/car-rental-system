import express from "express";

import {
  authMiddleware,
  requireAdmin,
  requireOwner,
  requireOwnerOrAdmin,
} from '../middleware/authMiddleware.js'

import { addCar, deleteCar, getAllCars, getCarDetails, getMyFleet, updateCar, uploadCarImage } from "../controllers/carController.js";

const router=express.Router()

router.post('/add-car',authMiddleware,requireOwner,addCar)
router.get("/get-allcars",authMiddleware,getAllCars)
router.get("/my-fleet",authMiddleware,requireOwnerOrAdmin,getMyFleet)
router.get("/:id",authMiddleware,getCarDetails)
router.patch("/update-car/:id",authMiddleware,requireAdmin,updateCar)
router.delete("/delete-car/:id",authMiddleware,requireAdmin,deleteCar)
router.post("/upload-image",authMiddleware,requireOwnerOrAdmin,uploadCarImage)
export default router
