import mongoose from "mongoose";

const carSchema=new mongoose.Schema({
    name:{type:String,required:[true,"car name is required"]},
    model:{type:String,required:[true,"car model is required"]},
    year:{type:Number,required:[true,"car year is required"]},
    category:{type:String,required:[true,"car category is required"]},
    fuel:{type:String,required:[true,"car fuel type is required"]},
    mileage:{type:Number,required:[true,"car mileage is required"]},
    price:{type:Number,required:[true,"car price is required"]},
    seats:{type:Number,required:[true,"car seats is required"]},
    about:{type:String,required:[true,"car about is required"]},
    image:{type:String,required:[true,"car image is required"]},
    transmission:{type:String},
    status:{type:String,default:"available"},
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
    numberPlate:{
        type:String,
        trim:true,
    },
    color:{
        type:String,
        trim:true,
    },
    vehicleType:{
        type:String,
        enum:["car","bike"],
        default:"car",
    },

}
,{timestamps:true});

carSchema.index(
    { numberPlate: 1 },
    { unique: true, sparse: true },
);

const carModel=mongoose.model("car",carSchema)

export default carModel;
       
