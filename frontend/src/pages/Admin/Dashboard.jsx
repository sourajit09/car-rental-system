import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import API from "../../api/API.jsx";
import LiveLocationMap from "../../components/LiveLocationMap.jsx";
import {
  buildLiveLocationSocketUrl,
  parseLiveLocationSocketMessage,
} from "../../utils/liveLocationSocket.js";

const SOCKET_RECONNECT_MS = 2000;

const initialCar = {
  name: "",
  model: "",
  year: "",
  category: "",
  fuel: "",
  mileage: "",
  price: "",
  seats: "",
  about: "",
  image: "",
  transmission: "",
  status: "available",
  numberPlate: "",
  color: "",
  vehicleType: "car",
};

const hasLocation = (booking) =>
  Number.isFinite(Number(booking?.liveLocation?.latitude)) &&
  Number.isFinite(Number(booking?.liveLocation?.longitude));

const getTrackingState = (booking) => {
  const updatedAt = booking?.liveLocation?.updatedAt
    ? new Date(booking.liveLocation.updatedAt).getTime()
    : null;
  const isFresh = updatedAt ? Date.now() - updatedAt < 60000 : false;

  if (booking?.liveLocation?.sharingEnabled && isFresh) {
    return {
      label: "Live now",
      className: "text-bg-success",
    };
  }

  if (hasLocation(booking)) {
    return {
      label: "Last known",
      className: "text-bg-secondary",
    };
  }

  return {
    label: "No signal",
    className: "text-bg-light",
  };
};

const mergeBookingById = (currentBookings, incomingBooking) => {
  const bookingIndex = currentBookings.findIndex(
    (booking) => booking._id === incomingBooking._id
  );

  if (bookingIndex === -1) {
    return [incomingBooking, ...currentBookings];
  }

  return currentBookings.map((booking) =>
    booking._id === incomingBooking._id ? incomingBooking : booking
  );
};

const getStreamStatusMeta = (streamStatus) => {
  switch (streamStatus) {
    case "live":
      return {
        label: "WebSocket Live",
        className: "text-bg-success",
      };
    case "reconnecting":
      return {
        label: "Reconnecting",
        className: "text-bg-warning",
      };
    default:
      return {
        label: "Connecting",
        className: "text-bg-secondary",
      };
  }
};

const OwnerDashboard = () => {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [form, setForm] = useState(initialCar);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [trackedBookingId, setTrackedBookingId] = useState(null);
  const [streamStatus, setStreamStatus] = useState("connecting");
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const fetchCars = async () => {
    try {
      setLoadingCars(true);
      const { data } = await API.get("/car/my-fleet");
      setCars(data?.cars || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load cars");
    } finally {
      setLoadingCars(false);
    }
  };

  const fetchBookings = async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoadingBookings(true);
      }
      const { data } = await API.get("/booking/all");
      const fetchedBookings = data?.bookings || [];
      setBookings(fetchedBookings);
      setTrackedBookingId((currentTrackedBookingId) => {
        if (
          currentTrackedBookingId &&
          fetchedBookings.some(
            (booking) => booking._id === currentTrackedBookingId
          )
        ) {
          return currentTrackedBookingId;
        }

        if (fetchedBookings.length === 0) {
          return null;
        }

        const firstTrackableBooking =
          fetchedBookings.find((booking) => hasLocation(booking)) ||
          fetchedBookings[0];

        return firstTrackableBooking?._id || null;
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      if (showSpinner) {
        setLoadingBookings(false);
      }
    }
  };

  useEffect(() => {
    fetchCars();
    fetchBookings();

    const token = localStorage.getItem("token");
    const socketUrl = buildLiveLocationSocketUrl(API.defaults.baseURL, token);

    if (!socketUrl) {
      setStreamStatus("reconnecting");
      return undefined;
    }

    let isActive = true;

    const connectSocket = () => {
      if (!isActive) {
        return;
      }

      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (isActive) {
          setStreamStatus("live");
        }
      };

      socket.onmessage = (event) => {
        const message = parseLiveLocationSocketMessage(event);
        if (!message) {
          return;
        }

        if (message.type === "connection") {
          setStreamStatus("live");
          return;
        }

        if (message.type === "booking-location" && message.booking?._id) {
          setBookings((currentBookings) =>
            mergeBookingById(currentBookings, message.booking)
          );
          setTrackedBookingId(
            (currentTrackedBookingId) =>
              currentTrackedBookingId || message.booking._id
          );
          setStreamStatus("live");
        }
      };

      socket.onerror = () => {
        if (isActive) {
          setStreamStatus("reconnecting");
        }
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (!isActive) {
          return;
        }

        setStreamStatus("reconnecting");
        reconnectTimerRef.current = setTimeout(connectSocket, SOCKET_RECONNECT_MS);
      };
    };

    connectSocket();

    return () => {
      isActive = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const trackedBooking =
    bookings.find((booking) => booking._id === trackedBookingId) || null;
  const streamStatusMeta = getStreamStatusMeta(streamStatus);

  const handleCarSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = form.image;
      if (imageFile) {
        setUploading(true);
        const base64 = await toBase64(imageFile);
        const { data } = await API.post("/car/upload-image", {
          file: base64,
          fileName: imageFile.name,
        });
        imageUrl = data?.url;
        setUploading(false);
      }

      const payload = { ...form, image: imageUrl };

      if (editingId) {
        const { data } = await API.patch(`/car/update-car/${editingId}`, payload);
        if (data?.success) {
          toast.success("Vehicle updated");
        }
      } else {
        const { data } = await API.post("/car/add-car", payload);
        if (data?.success) {
          toast.success("Vehicle added");
        }
      }
      setForm(initialCar);
      setEditingId(null);
      setImageFile(null);
      fetchCars();
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed");
      setUploading(false);
    }
  };

  const handleEdit = (car) => {
    setEditingId(car._id);
    setForm({
      name: car.name,
      model: car.model,
      year: car.year,
      category: car.category,
      fuel: car.fuel,
      mileage: car.mileage,
      price: car.price,
      seats: car.seats,
      about: car.about,
      image: car.image,
      transmission: car.transmission || "",
      status: car.status || "available",
      numberPlate: car.numberPlate || "",
      color: car.color || "",
      vehicleType: car.vehicleType === "bike" ? "bike" : "car",
    });
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this car?")) return;
    try {
      const { data } = await API.delete(`/car/delete-car/${id}`);
      if (data?.success) {
        toast.success("Vehicle deleted");
        fetchCars();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      const { data } = await API.patch(`/booking/status/${bookingId}`, {
        status,
      });
      if (data?.success) {
        toast.success("Status updated");
        fetchBookings(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Status update failed");
    }
  };

  return (
    <div className="container section-pad">
      <h3 className="mb-4">Owner Dashboard</h3>

      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h5 className="mb-2">Business live tracking</h5>
            <p className="text-muted mb-0">
              This dashboard now listens over WebSocket, so the owner can watch
              the renter move on the map in realtime like a delivery-tracking
              console instead of waiting for polling.
            </p>
          </div>
          <span className={`badge ${streamStatusMeta.className}`}>
            {streamStatusMeta.label}
          </span>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-dark text-white">Live Tracking Map</div>
        <div className="card-body">
          {trackedBooking ? (
            <>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                <div>
                  <strong>{trackedBooking?.car?.name || "Unknown car"}</strong>
                  <div className="text-muted">
                    {trackedBooking?.user?.uname || trackedBooking?.user?.email}
                  </div>
                </div>
                <span
                  className={`badge ${getTrackingState(trackedBooking).className}`}
                >
                  {getTrackingState(trackedBooking).label}
                </span>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-3">
                  <div className="border rounded p-3 h-100">
                    <strong>Customer Phone</strong>
                    <div className="text-muted">
                      {trackedBooking?.user?.phone || "--"}
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3 h-100">
                    <strong>Accuracy</strong>
                    <div className="text-muted">
                      {trackedBooking?.liveLocation?.accuracy
                        ? `${Math.round(trackedBooking.liveLocation.accuracy)} m`
                        : "--"}
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3 h-100">
                    <strong>Last Update</strong>
                    <div className="text-muted">
                      {trackedBooking?.liveLocation?.updatedAt
                        ? new Date(
                            trackedBooking.liveLocation.updatedAt
                          ).toLocaleString()
                        : "--"}
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3 h-100">
                    <strong>Coordinates</strong>
                    <div className="text-muted">
                      {hasLocation(trackedBooking)
                        ? `${Number(
                            trackedBooking.liveLocation.latitude
                          ).toFixed(5)}, ${Number(
                            trackedBooking.liveLocation.longitude
                          ).toFixed(5)}`
                        : "--"}
                    </div>
                  </div>
                </div>
              </div>

              <LiveLocationMap
                title={`${trackedBooking?.car?.name || "Car"} live location`}
                latitude={
                  hasLocation(trackedBooking)
                    ? Number(trackedBooking.liveLocation.latitude)
                    : undefined
                }
                longitude={
                  hasLocation(trackedBooking)
                    ? Number(trackedBooking.liveLocation.longitude)
                    : undefined
                }
                height={380}
              />
            </>
          ) : (
            <p className="mb-0 text-muted">
              Pick a booking from the table below to see its current map.
            </p>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          {editingId ? "Edit Vehicle" : "Add New Vehicle"}
        </div>
        <div className="card-body">
          <form className="row g-3" onSubmit={handleCarSubmit}>
            <div className="col-md-4">
              <label className="form-label">Vehicle type</label>
              <select
                className="form-select"
                value={form.vehicleType}
                onChange={(e) =>
                  setForm({ ...form, vehicleType: e.target.value })
                }
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Number plate</label>
              <input
                className="form-control"
                value={form.numberPlate}
                onChange={(e) =>
                  setForm({ ...form, numberPlate: e.target.value })
                }
                placeholder="e.g. KA01AB1234"
                required
                disabled={Boolean(editingId)}
              />
              {editingId && (
                <small className="text-muted">Plate cannot be changed</small>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label">Colour</label>
              <input
                className="form-control"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Model</label>
              <input
                className="form-control"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Year</label>
              <input
                type="number"
                className="form-control"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <input
                className="form-control"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Fuel</label>
              <input
                className="form-control"
                value={form.fuel}
                onChange={(e) => setForm({ ...form, fuel: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Mileage</label>
              <input
                type="number"
                className="form-control"
                value={form.mileage}
                onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Seats</label>
              <input
                type="number"
                className="form-control"
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Price / day</label>
              <input
                type="number"
                className="form-control"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Transmission</label>
              <input
                className="form-control"
                value={form.transmission}
                onChange={(e) =>
                  setForm({ ...form, transmission: e.target.value })
                }
              />
            </div>
            <div className="col-md-8">
              <label className="form-label">Image URL or Upload</label>
              <input
                className="form-control mb-2"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="Paste image URL or upload below"
              />
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
              {uploading && <small className="text-muted">Uploading...</small>}
            </div>
            <div className="col-12">
              <label className="form-label">About</label>
              <textarea
                className="form-control"
                rows="2"
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                required
              ></textarea>
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-primary" type="submit">
                {editingId ? "Update" : "Add Car"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setForm(initialCar);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-dark text-white">Your Vehicles</div>
        <div className="card-body table-responsive">
          {loadingCars ? (
            <p>Loading vehicles...</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Plate</th>
                  <th>Color</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cars?.map((car) => (
                  <tr key={car._id}>
                    <td className="text-capitalize">{car.vehicleType || "car"}</td>
                    <td>{car.name}</td>
                    <td>{car.numberPlate || "--"}</td>
                    <td>{car.color || "--"}</td>
                    <td>{car.model}</td>
                    <td>{car.year}</td>
                    <td>₹{car.price}</td>
                    <td className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(car)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(car._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {cars?.length === 0 && (
                  <tr>
                    <td colSpan="8">No vehicles found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>Bookings</span>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={() => fetchBookings(false)}
          >
            Refresh tracking
          </button>
        </div>
        <div className="card-body table-responsive">
          {loadingBookings ? (
            <p>Loading bookings...</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Car</th>
                  <th>Start</th>
                  <th>Return</th>
                  <th>Status</th>
                  <th>Tracking</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings?.map((booking) => {
                  const trackingState = getTrackingState(booking);

                  return (
                    <tr key={booking._id}>
                      <td>{booking?.user?.email}</td>
                      <td>{booking?.car?.name}</td>
                      <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                      <td>{new Date(booking.returnDate).toLocaleDateString()}</td>
                      <td className="text-capitalize">{booking.status}</td>
                      <td>
                        <span className={`badge ${trackingState.className}`}>
                          {trackingState.label}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <select
                            className="form-select form-select-sm"
                            value={booking.status}
                            onChange={(e) =>
                              handleStatusChange(booking._id, e.target.value)
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="confirm">Confirm</option>
                            <option value="cancel">Cancel</option>
                          </select>
                          <button
                            className="btn btn-sm btn-outline-dark"
                            onClick={() => setTrackedBookingId(booking._id)}
                          >
                            Track
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {bookings?.length === 0 && (
                  <tr>
                    <td colSpan="7">No bookings found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
