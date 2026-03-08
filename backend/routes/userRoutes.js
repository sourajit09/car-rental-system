import express from "express"
import { register } from "../controllers/userController.js"

const router=express.Router()  

router.post("/register",register)

router.patch("/update/:id",authM)

export default router