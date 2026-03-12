import mongoose from "mongoose";

const carSchema=new mongoose.Schema({
    name:{type:String,require:[true,"car name is required"]},
    model:{type:String,require:[true,"car model is required"]},
    year:{type:Number,require:[true,"car year is required"]},
    category:{type:String,require:[true,"car category is required"]},
    fuel:{type:String,require:[true,"car fuel type is required"]},
    mileage:{type:Number,require:[true,"car mileage is required"]},
    price:{type:Number,require:[true,"car price is required"]},
    seats:{type:Number,require:[true,"car seats is required"]},
    about:{type:String,require:[true,"car about is required"]},
    image:{type:String,require:[true,"car image is required"]},

}
,{timestamps:true});

const carModel=mongoose.model("car",carSchema)

export default carModel;
       