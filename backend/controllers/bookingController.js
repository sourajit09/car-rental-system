import bookingModel from "../models/bookingModel.js";

//Booking
export const createBooking = async (req, res) => {
  try {
    const {user,car,startDate,returnDate,price,totalPrice}=req.body
    if(!car || !user|| !startDate|| !returnDate || !price|| !totalPrice){
        return res.status(500).send({
            success:false,
            message:"Please provide all the fields"
        })
    }
    const booking=new bookingModel({user,car,startDate,returnDate,price,totalPrice})
    await booking.save()
    res.status(201).send({
        success:true,
        message:"booking success"
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success:false,
      message:"Error in create booking api"
    });
  }
};
