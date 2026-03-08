import mongoose from "mongoose";


export const connectDb=async()=>{
  try{
      const URI=process.env.MONGO_URI
    const conn=await mongoose.connect(URI)
    if(conn){
        console.log(`connected to database`)
    }
  } catch(err){
    console.log(err)
  }
}