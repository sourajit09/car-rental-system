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
