import bookingModel from "../models/bookingModel.js";
import carModel from "../models/carModel.js";
import userModel from "../models/userModel.js";
import { saveBookingLocationUpdate } from "../services/bookingTrackingService.js";
import { broadcastBookingLocation } from "../utils/liveLocationSocket.js";

// helper to compute days between two dates (inclusive of start day)
const calculateTotalPrice = (startDate, returnDate, carPrice) => {
  const start = new Date(startDate);
  const end = new Date(returnDate);
  const diffDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
  return diffDays * carPrice;
};

const isLegacyElevatedUser = (user) =>
  user?.isAdmin === true && user?.role !== "owner";

const canOwnerManageBooking = (booking, user) => {
  if (!booking || !user?.id) {
    return false;
  }

  if (isLegacyElevatedUser(user)) {
    return true;
  }

  if (booking.user?.toString() === user.id) {
    return true;
  }

  const ownerId = booking.owner?._id || booking.owner || booking.car?.owner?._id || booking.car?.owner;
  return String(ownerId || "") === user.id;
};

// Create booking
export const createBooking = async (req, res) => {
  try {
    const { car, startDate, returnDate } = req.body;
    const user = req.user?.id;

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!car || !startDate || !returnDate) {
      return res.status(400).send({
        success: false,
        message: "car, startDate and returnDate are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(returnDate);
    if (isNaN(start) || isNaN(end) || end < start) {
      return res.status(400).send({
        success: false,
        message: "Return date must be after start date",
      });
    }

    const carDoc = await carModel.findById(car);
    if (!carDoc) {
      return res.status(404).send({
        success: false,
        message: "Car not found",
      });
    }

    // check availability (overlap with pending/confirm bookings)
    const conflict = await bookingModel.findOne({
      car,
      status: { $in: ["pending", "confirm"] },
      $or: [
        { startDate: { $lte: end }, returnDate: { $gte: start } },
        { startDate: { $lte: start }, returnDate: { $gte: start } },
      ],
    });
    if (conflict) {
      return res.status(400).send({
        success: false,
        message: "Car not available for selected dates",
      });
    }

    const totalPrice = calculateTotalPrice(startDate, returnDate, carDoc.price);

    const booking = new bookingModel({
      user,
      car,
      owner: carDoc.owner || null,
      startDate,
      returnDate,
      price: carDoc.price,
      totalPrice,
    });
    await booking.save();

    res.status(201).send({
      success: true,
      message: "Booking created",
      booking,
      totalPrice,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in create booking api",
      error,
    });
  }
};

// Get bookings for logged-in user
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await bookingModel
      .find({ user: req.user.id })
      .populate("car");
    res.status(200).send({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching bookings",
      error,
    });
  }
};

// Owner/Admin: bookings (fleet owners see only their vehicles' trips)
export const getAllBookings = async (req, res) => {
  try {
    const dbUser = await userModel.findById(req.user.id).lean();
    const isLegacyElevated = isLegacyElevatedUser(dbUser);

    let query = {};
    if (!isLegacyElevated && dbUser?.role === "owner") {
      const myCarIds = await carModel.find({ owner: req.user.id }).distinct("_id");
      query = { car: { $in: myCarIds } };
    }

    const bookings = await bookingModel
      .find(query)
      .populate("user", "uname email phone")
      .populate({
        path: "car",
        populate: { path: "owner", select: "uname email phone" },
      });
    res.status(200).send({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching all bookings",
      error,
    });
  }
};

// Update booking status (owner / admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["pending", "confirm", "cancel"].includes(status)) {
      return res.status(400).send({
        success: false,
        message: "Invalid status value",
      });
    }
    const booking = await bookingModel
      .findById(id)
      .populate("car", "owner");
    if (!booking) {
      return res.status(404).send({
        success: false,
        message: "Booking not found",
      });
    }

    if (!canOwnerManageBooking(booking, req.user)) {
      return res.status(403).send({
        success: false,
        message: "Not allowed to update this booking",
      });
    }

    booking.status = status;
    await booking.save();
    res.status(200).send({
      success: true,
      message: "Booking status updated",
      booking,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error updating booking status",
      error,
    });
  }
};

// Delete booking (user can delete own, admin any)
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await bookingModel
      .findById(id)
      .populate("car", "owner");
    if (!booking) {
      return res.status(404).send({
        success: false,
        message: "Booking not found",
      });
    }

    if (!canOwnerManageBooking(booking, req.user)) {
      return res.status(403).send({
        success: false,
        message: "Not allowed to delete this booking",
      });
    }
    await booking.deleteOne();
    res.status(200).send({
      success: true,
      message: "Booking deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error deleting booking",
      error,
    });
  }
};

export const updateBookingLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, accuracy, sharingEnabled } = req.body;
    const booking = await saveBookingLocationUpdate({
      bookingId: id,
      actor: req.user,
      latitude,
      longitude,
      accuracy,
      sharingEnabled,
    });

    broadcastBookingLocation(booking.toObject());

    res.status(200).send({
      success: true,
      message:
        sharingEnabled === false
          ? "Location sharing stopped"
          : "Live location updated",
      booking,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).send({
        success: false,
        message: error.message,
      });
    }

    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error updating booking location",
      error,
    });
  }
};
