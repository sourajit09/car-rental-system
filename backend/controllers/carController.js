import carModel from "./../models/carModel.js";

// ADD CAR
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
      model,
    } = req.body;

    if (
      !name ||
      !about ||
      !year ||
      !seats ||
      !fuel ||
      !category ||
      !price ||
      !image ||
      !model
    ) {
      return res.status(400).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    const car = new carModel({
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
      model,
    });

    await car.save();

    res.status(201).send({
      success: true,
      message: "Car created successfully",
      car,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Add Car API",
      error,
    });
  }
};

//  GET ALL CARS
export const getAllCars = async (req, res) => {
  try {
    const cars = await carModel.find({});

    res.status(200).send({
      success: true,
      message: "All Cars",
      totalCar: cars.length,
      cars,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get all Car API",
      error,
    });
  }
};

//  GET SINGLE CAR
export const getCarDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(404).send({
        success: false,
        message: "Car id not found",
      });
    }

    const car = await carModel.findById(id);

    if (!car) {
      return res.status(404).send({
        success: false,
        message: "No car found with this id",
      });
    }

    res.status(200).send({
      success: true,
      message: "Car details fetched successfully",
      car,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Car details API",
      error,
    });
  }
};

//  UPDATE CAR
export const updateCar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(404).send({
        success: false,
        message: "Car id not found",
      });
    }

    const data = req.body;

    const car = await carModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Car updated successfully",
      car,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Update Car API",
      error,
    });
  }
};