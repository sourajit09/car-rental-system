import mongoose from "mongoose";

const bookingSchema=new mongoose.Schema({
user:{
    type:mongoose.Schema.Types.ObjectId,
    requried:true,
    ref:"user"
},
car:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"car"
},
startDate:{type:Date,required:[true,'start date is required']},
returnDate:{type:Date,reqruied:[true,'return date is required']},
totalPrice:{type:Number,required:[true,'price is required']},
status:{type:String,enum:['pending','confirm','cancel'],
    default:"pending",
},
},{timestamps:true})

const bookingModel=mongoose.model("booking",bookingSchema)
export default bookingModel