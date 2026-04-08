import bookingModel from "../models/bookingModel.js";

const createTrackingError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

const canAccessBooking = (booking, actor) => {
  if (!booking || !actor?.id) {
    return false;
  }

  // Only the renter pushes live coordinates; owners receive via WebSocket broadcast.
  return booking.user.toString() === actor.id;
};

const isValidLatitude = (value) =>
  Number.isFinite(value) && value >= -90 && value <= 90;

const isValidLongitude = (value) =>
  Number.isFinite(value) && value >= -180 && value <= 180;

export const populateBookingTrackingData = async (booking) => {
  await booking.populate([
    {
      path: "car",
      populate: { path: "owner", select: "uname email phone" },
    },
    { path: "user", select: "uname email phone" },
  ]);

  return booking;
};

export const saveBookingLocationUpdate = async ({
  bookingId,
  actor,
  latitude,
  longitude,
  accuracy,
  sharingEnabled,
}) => {
  if (!bookingId) {
    throw createTrackingError(400, "Booking id is required");
  }

  const booking = await bookingModel.findById(bookingId);
  if (!booking) {
    throw createTrackingError(404, "Booking not found");
  }

  if (!canAccessBooking(booking, actor)) {
    throw createTrackingError(403, "Not allowed to update this booking location");
  }

  if (sharingEnabled === false) {
    booking.liveLocation = {
      ...booking.liveLocation?.toObject?.(),
      sharingEnabled: false,
      updatedAt: new Date(),
    };

    await booking.save();
    return populateBookingTrackingData(booking);
  }

  if (booking.status === "cancel") {
    throw createTrackingError(
      400,
      "Cancelled bookings cannot share live location"
    );
  }

  const latitudeNumber = Number(latitude);
  const longitudeNumber = Number(longitude);
  const accuracyNumber =
    accuracy === undefined || accuracy === null ? null : Number(accuracy);

  if (!isValidLatitude(latitudeNumber) || !isValidLongitude(longitudeNumber)) {
    throw createTrackingError(400, "Valid latitude and longitude are required");
  }

  booking.liveLocation = {
    latitude: latitudeNumber,
    longitude: longitudeNumber,
    accuracy:
      Number.isFinite(accuracyNumber) && accuracyNumber >= 0
        ? accuracyNumber
        : null,
    sharingEnabled: true,
    source: "browser",
    updatedAt: new Date(),
  };

  await booking.save();
  return populateBookingTrackingData(booking);
};
