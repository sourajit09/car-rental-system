import express from "express"
import {
  forgotPassword,
  getProfile,
  login,
  register,
  resetPassword,
  updateUser,
} from "../controllers/userController.js"
import { authMiddleware } from './../middleware/authMiddleware.js'

const router=express.Router()  

router.post("/register",register)
router.post("/login",login)
router.post("/forgot-password",forgotPassword)
router.post("/reset-password",resetPassword)

router.get("/me",authMiddleware,getProfile)

router.patch("/update/:id",authMiddleware,updateUser)


export default router
