export const addCar=async(req,res)=>{
    try {
        const {name,about,year,seat,mileage,Price per day}=req.body
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error in adding car",
            error
        })
    }
}