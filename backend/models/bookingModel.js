import mongoose from "mongoose";

const liveLocationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    sharingEnabled: { type: Boolean, default: false },
    source: { type: String, default: "browser" },
    updatedAt: { type: Date, default: null },
  },
  { _id: false }
);

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
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    default:null,
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
  liveLocation: {
    type: liveLocationSchema,
    default: () => ({}),
  },
},{timestamps:true})

const bookingModel = mongoose.model("booking", bookingSchema);
export default bookingModel;
