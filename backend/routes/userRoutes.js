import express from "express"
import { getProfile, login, register, updateUser } from "../controllers/userController.js"
import { authMiddleware } from './../middleware/authMiddleware.js'

const router=express.Router()  

router.post("/register",register)
router.post("/login",login)

router.get("/me",authMiddleware,getProfile)

router.patch("/update/:id",authMiddleware,updateUser)


export default router
