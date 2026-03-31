import express from "express"
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js"
import { createBooking, deleteBooking, getAllBookings, getMyBookings, updateBookingStatus } from "../controllers/bookingController.js"

const router=express.Router()

//CREATE|| POST
router.post("/create",authMiddleware,createBooking)

//user bookings
router.get("/my",authMiddleware,getMyBookings)

//admin - all bookings
router.get("/all",authMiddleware,isAdmin,getAllBookings)

//update status
router.patch("/status/:id",authMiddleware,isAdmin,updateBookingStatus)

//delete booking
router.delete("/:id",authMiddleware,deleteBooking)

export default router
