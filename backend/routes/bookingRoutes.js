import express from "express"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { createBooking } from "../controllers/bookingController.js"

const router=express.Router()

//CREATE|| POST
router.post("/create",authMiddleware,createBooking)

export default router