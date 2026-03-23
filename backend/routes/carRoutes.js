import express from "express";

import {isAdmin, authMiddleware} from '../middleware/authMiddleware.js'

import { addCar, getAllCars, getCarDetails, updateCar } from "../controllers/carController.js";

const router=express.Router()

router.post('/add-car',authMiddleware,isAdmin,addCar)
router.get("/get-allcars",getAllCars)
router.get("/:id",getCarDetails)
router.patch("/update-car/:id",updateCar)
export default router
