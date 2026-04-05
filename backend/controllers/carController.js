import carModel from "./../models/carModel.js";
import bookingModel from "../models/bookingModel.js";
import userModel from "../models/userModel.js";
import { imagekit, isImageKitConfigured } from "../config/imagekit.js";

const listedCarFilter = () => ({
  owner: { $exists: true, $ne: null },
});

const canManageCar = async (req, car) => {
  if (!car) {
    return false;
  }
  const dbUser = await userModel.findById(req.user.id).lean();
  const isLegacyElevated =
    dbUser?.isAdmin === true && dbUser?.role !== "owner";
  if (isLegacyElevated) {
    return true;
  }
  if (dbUser?.role === "owner" && car.owner?.toString() === req.user.id) {
    return true;
  }
  return false;
};

// ADD CAR (fleet owner)
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
      numberPlate,
      color,
      vehicleType,
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
      !model ||
      !numberPlate ||
      !color
    ) {
      return res.status(400).send({
        success: false,
        message:
          "Please provide all fields including number plate and colour",
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
      numberPlate: String(numberPlate).trim().toUpperCase(),
      color: String(color).trim(),
      vehicleType: vehicleType === "bike" ? "bike" : "car",
      owner: req.user.id,
    });

    await car.save();
    await car.populate("owner", "uname email phone");

    res.status(201).send({
      success: true,
      message: "Vehicle listed successfully",
      car,
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).send({
        success: false,
        message: "This number plate is already registered",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in Add Car API",
      error,
    });
  }
};

// Logged-in customers: marketplace (all owners' listed vehicles)
export const getAllCars = async (req, res) => {
  try {
    const { startDate, returnDate } = req.query;
    let cars = [];
    const baseFilter = listedCarFilter();

    if (startDate && returnDate) {
      const start = new Date(startDate);
      const end = new Date(returnDate);

      const bookedIds = await bookingModel.find({
        status: { $in: ["pending", "confirm"] },
        $or: [
          { startDate: { $lte: end }, returnDate: { $gte: start } },
          { startDate: { $lte: start }, returnDate: { $gte: start } },
        ],
      }).distinct("car");

      cars = await carModel
        .find({
          ...baseFilter,
          _id: { $nin: bookedIds },
        })
        .populate("owner", "uname email phone");
    } else {
      cars = await carModel
        .find(baseFilter)
        .populate("owner", "uname email phone");
    }

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

// Owner dashboard: only this owner's vehicles
export const getMyFleet = async (req, res) => {
  try {
    const cars = await carModel
      .find({ owner: req.user.id })
      .populate("owner", "uname email phone")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "Your fleet",
      totalCar: cars.length,
      cars,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error loading fleet",
      error,
    });
  }
};

// GET SINGLE CAR (authenticated)
export const getCarDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(404).send({
        success: false,
        message: "Car id not found",
      });
    }

    const car = await carModel
      .findOne({ _id: id, ...listedCarFilter() })
      .populate("owner", "uname email phone");

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

// UPDATE CAR
export const updateCar = async (req, res) => {
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
        message: "Car not found",
      });
    }

    const allowed = await canManageCar(req, car);
    if (!allowed) {
      return res.status(403).send({
        success: false,
        message: "Not allowed to update this vehicle",
      });
    }

    const data = { ...req.body };
    delete data.owner;
    if (data.numberPlate) {
      data.numberPlate = String(data.numberPlate).trim().toUpperCase();
    }
    if (data.vehicleType && !["car", "bike"].includes(data.vehicleType)) {
      delete data.vehicleType;
    }

    const updated = await carModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate("owner", "uname email phone");

    res.status(200).send({
      success: true,
      message: "Car updated successfully",
      car: updated,
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).send({
        success: false,
        message: "This number plate is already registered",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in Update Car API",
      error,
    });
  }
};

export const deleteCar = async (req, res) => {
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
        message: "Car not found",
      });
    }

    const allowed = await canManageCar(req, car);
    if (!allowed) {
      return res.status(403).send({
        success: false,
        message: "Not allowed to delete this vehicle",
      });
    }

    await carModel.findByIdAndDelete({ _id: id });
    return res.status(200).send({
      success: true,
      message: "car has been deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Delete Car API",
      error,
    });
  }
};

// upload image via ImageKit (base64)
export const uploadCarImage = async (req, res) => {
  try {
    if (!isImageKitConfigured()) {
      return res.status(500).send({
        success: false,
        message: "ImageKit keys missing in env",
      });
    }
    const { file, fileName } = req.body;
    if (!file || !fileName) {
      return res.status(400).send({
        success: false,
        message: "file (base64) and fileName are required",
      });
    }

    const uploadResponse = await imagekit.upload({
      file, // base64 string
      fileName,
      folder: "/car-rental",
    });

    return res.status(200).send({
      success: true,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Image upload failed",
      error,
    });
  }
};
