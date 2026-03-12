import express from "express"
import { register } from "../controllers/userController.js"
import { authMiddleware } from './../middleware/authMiddleware.js'

const router=express.Router()  

router.post("/register",register)

router.patch("/update/:id",authMiddleware)

export default router