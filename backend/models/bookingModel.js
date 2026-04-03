import mongoose from "mongoose";

const bookingSchema=new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"user"
  },
  car:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"car"
  },
  startDate:{type:Date,required:[true,'start date is required']},
  returnDate:{type:Date,required:[true,'return date is required']},
  price:{type:Number,required:[true,'price is required']}, // per-day or unit price
  totalPrice:{type:Number,required:[true,'total price is required']},
  status:{type:String,enum:['pending','confirm','cancel'],
    default:"pending",
  },
   paymentId: {
    type: String,       // ✅ stores Razorpay payment ID after success
    default: null,
  },
},{timestamps:true})

const bookingModel=mongoose.model("booking",bookingSchema)
export default bookingModel
