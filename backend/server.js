import express from "express";
import colors from "colors"
import cors from "cors"
import dotenv from "dotenv"
import { connectDb } from "./config/db.js";
const app=express();
import {userController} from "./controllers/userController.js"

dotenv.config()
connectDb()

app.use(cors())
app.use(express.json())



app.get("/",(req,res)=>{
    res.send("this is server")
})
app.use("/api/auth")

const port=process.env.PORT
 
app.listen(port,()=>{
    console.log(`server is running on http://localhost:${port}`);
})
