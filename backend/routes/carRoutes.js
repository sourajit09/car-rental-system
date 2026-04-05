import express from "express";

import {isAdmin, authMiddleware} from '../middleware/authMiddleware.js'

import { addCar, deleteCar, getAllCars, getCarDetails, getMyFleet, updateCar, uploadCarImage } from "../controllers/carController.js";

const router=express.Router()

router.post('/add-car',authMiddleware,isAdmin,addCar)
router.get("/get-allcars",authMiddleware,getAllCars)
router.get("/my-fleet",authMiddleware,isAdmin,getMyFleet)
router.get("/:id",authMiddleware,getCarDetails)
router.patch("/update-car/:id",authMiddleware,isAdmin,updateCar)
router.delete("/delete-car/:id",authMiddleware,isAdmin,deleteCar)
router.post("/upload-image",authMiddleware,isAdmin,uploadCarImage)
export default router
