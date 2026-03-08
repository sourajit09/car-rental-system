import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import { connectDb } from "./config/db.js";
const app=express();
import userRoutes from "./routes/userRoutes.js"

dotenv.config()
connectDb()

app.use(cors())
app.use(express.json())

//routes
app.use("/api/v1/user",userRoutes)

app.get("/",(req,res)=>{
    res.send("this is server")
})


const port=process.env.PORT
 
app.listen(port,()=>{
    console.log(`server is running on http://localhost:${port}`);
})
