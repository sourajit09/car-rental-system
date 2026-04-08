import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import { createServer } from "http";
import { connectDb } from "./config/db.js";
const app=express();
import userRoutes from "./routes/userRoutes.js"
import carRoutes from "./routes/carRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import { initLiveLocationWebSocketServer } from "./utils/liveLocationSocket.js";

dotenv.config()
connectDb()

app.use(cors())
app.use(express.json())

//routes
app.use("/api/v1/user",userRoutes)
app.use("/api/v1/car",carRoutes)
app.use("/api/v1/booking",bookingRoutes)
app.use("/api/v1/payment",paymentRoutes)

app.get("/",(req,res)=>{
    res.send("this is server")
})


const port=process.env.PORT
const server = createServer(app);

initLiveLocationWebSocketServer(server);
 
server.listen(port,()=>{
    console.log(`server is running on http://localhost:${port}`);
})
