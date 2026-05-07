import express from "express"
import { authMiddleware, requireAdmin, requireOwnerOrAdmin } from "../middleware/authMiddleware.js"
import { createBooking, deleteBooking, getAllBookings, getMyBookings, getOwnerBookings, updateBookingLocation, updateBookingStatus } from "../controllers/bookingController.js"

const router=express.Router()

//CREATE|| POST
router.post("/create",authMiddleware,createBooking)

//user bookings
router.get("/my",authMiddleware,getMyBookings)

//admin - all bookings
router.get("/all",authMiddleware,requireAdmin,getAllBookings)

//owner - bookings for their vehicles
router.get("/owner",authMiddleware,requireOwnerOrAdmin,getOwnerBookings)

//update status
router.patch("/status/:id",authMiddleware,requireAdmin,updateBookingStatus)

//live location update
router.patch("/:id/location",authMiddleware,updateBookingLocation)

//delete booking
router.delete("/:id",authMiddleware,deleteBooking)

export default router
