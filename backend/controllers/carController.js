<<<<<<< HEAD
export const addCar=async(req,res)=>{
    try {
        const {name,about,year,seat,mileage,pricePerDay}=req.body
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error in adding car",
            error
        })
=======
export const addCar = async (req, res) => {
  try {
    const {
      name,
      about,
      year,
      seats,
      mileage,
      fuel,
      category,
      price,
      image,
      status,
      transmission,
    } = req.body;
    if (
      !name ||
      !about ||
      !year ||
      !seats ||
      !fuel ||
      !category ||
      !price ||
      !image
    ) {
      return res.status(500).send({
        success: false,
        message: "Please provide all fields",
      });
>>>>>>> 396770189ea183a0574c3e6001d197c34f782421
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Add Car API",
      error,
    });
  }
};
