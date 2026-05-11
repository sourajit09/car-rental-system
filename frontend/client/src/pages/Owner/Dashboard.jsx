import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import API from "../../api/API.jsx";
import LiveLocationMap from "../../components/LiveLocationMap.jsx";
import {
  buildLiveLocationSocketUrl,
  parseLiveLocationSocketMessage,
} from "../../utils/liveLocationSocket.js";

const initialVehicle = {
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

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const SOCKET_RECONNECT_MS = 2000;

const hasLocation = (booking) =>
  Number.isFinite(Number(booking?.liveLocation?.latitude)) &&
  Number.isFinite(Number(booking?.liveLocation?.longitude));

const mergeBookingById = (currentBookings, incomingBooking) => {
  if (!incomingBooking?._id) {
    return currentBookings;
  }

  const exists = currentBookings.some(
    (booking) => booking._id === incomingBooking._id
  );

  if (!exists) {
    return [incomingBooking, ...currentBookings];
  }

  return currentBookings.map((booking) =>
    booking._id === incomingBooking._id ? incomingBooking : booking
  );
};

const OwnerDashboard = () => {
  const [form, setForm] = useState(initialVehicle);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
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
      toast.error(error.response?.data?.message || "Failed to load vehicles");
    } finally {
      setLoadingCars(false);
    }
  };

  const fetchBookings = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoadingBookings(true);
      const { data } = await API.get("/booking/owner");
      const fetchedBookings = data?.bookings || [];
      setBookings(fetchedBookings);
      setTrackedBookingId((currentId) => {
        if (currentId && fetchedBookings.some((b) => b._id === currentId)) {
          return currentId;
        }
        const firstTrackable =
          fetchedBookings.find((b) => hasLocation(b)) || fetchedBookings[0];
        return firstTrackable?._id || null;
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      if (showSpinner) setLoadingBookings(false);
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
      if (!isActive) return;

      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (isActive) setStreamStatus("live");
      };

      socket.onmessage = (event) => {
        const message = parseLiveLocationSocketMessage(event);
        if (!message) return;

        if (message.type === "connection") {
          setStreamStatus("live");
          return;
        }

        if (message.type === "booking-location" && message.booking?._id) {
          setBookings((current) => mergeBookingById(current, message.booking));
          setTrackedBookingId((currentId) => currentId || message.booking._id);
          setStreamStatus("live");
        }
      };

      socket.onerror = () => {
        if (isActive) setStreamStatus("reconnecting");
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }
        if (!isActive) return;
        setStreamStatus("reconnecting");
        reconnectTimerRef.current = setTimeout(connectSocket, SOCKET_RECONNECT_MS);
      };
    };

    connectSocket();

    return () => {
      isActive = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const trackedBooking = bookings.find((b) => b._id === trackedBookingId) || null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
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

      const { data } = await API.post("/car/add-car", {
        ...form,
        image: imageUrl,
      });

      if (data?.success) {
        toast.success("Vehicle added");
        setForm(initialVehicle);
        setImageFile(null);
        fetchCars();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Vehicle add failed");
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container section-pad">
      <h3 className="mb-4">Owner Dashboard</h3>

      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h5 className="mb-2">Live customer tracking</h5>
            <p className="text-muted mb-0">
              Customers can share realtime location from their profile during an
              active booking. You will see it update here like a delivery app.
            </p>
          </div>
          <span
            className={`badge ${
              streamStatus === "live"
                ? "text-bg-success"
                : streamStatus === "reconnecting"
                  ? "text-bg-warning"
                  : "text-bg-secondary"
            }`}
          >
            {streamStatus === "live"
              ? "WebSocket Live"
              : streamStatus === "reconnecting"
                ? "Reconnecting"
                : "Connecting"}
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
                  <strong>{trackedBooking?.car?.name || "Unknown vehicle"}</strong>
                  <div className="text-muted">
                    {trackedBooking?.user?.uname || trackedBooking?.user?.email}
                  </div>
                </div>
                <span
                  className={`badge ${
                    trackedBooking?.liveLocation?.sharingEnabled ? "text-bg-success" : "text-bg-secondary"
                  }`}
                >
                  {trackedBooking?.liveLocation?.sharingEnabled ? "Live now" : "Last known"}
                </span>
              </div>

              <LiveLocationMap
                title={`${trackedBooking?.car?.name || "Vehicle"} live location`}
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
              No bookings yet. Once a customer books your vehicle and starts sharing, you’ll see it here.
            </p>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-dark text-white">Add New Vehicle</div>
        <div className="card-body">
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-4">
              <label className="form-label">Vehicle type</label>
              <select
                className="form-select"
                value={form.vehicleType}
                onChange={(event) =>
                  setForm({ ...form, vehicleType: event.target.value })
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
                onChange={(event) =>
                  setForm({ ...form, numberPlate: event.target.value })
                }
                placeholder="e.g. KA01AB1234"
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Colour</label>
              <input
                className="form-control"
                value={form.color}
                onChange={(event) => setForm({ ...form, color: event.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Model</label>
              <input
                className="form-control"
                value={form.model}
                onChange={(event) => setForm({ ...form, model: event.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Year</label>
              <input
                type="number"
                className="form-control"
                value={form.year}
                onChange={(event) => setForm({ ...form, year: event.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <input
                className="form-control"
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Fuel</label>
              <input
                className="form-control"
                value={form.fuel}
                onChange={(event) => setForm({ ...form, fuel: event.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Mileage</label>
              <input
                type="number"
                className="form-control"
                value={form.mileage}
                onChange={(event) =>
                  setForm({ ...form, mileage: event.target.value })
                }
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Seats</label>
              <input
                type="number"
                className="form-control"
                value={form.seats}
                onChange={(event) => setForm({ ...form, seats: event.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Price / day</label>
              <input
                type="number"
                className="form-control"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Transmission</label>
              <input
                className="form-control"
                value={form.transmission}
                onChange={(event) =>
                  setForm({ ...form, transmission: event.target.value })
                }
              />
            </div>
            <div className="col-md-8">
              <label className="form-label">Image URL or Upload</label>
              <input
                className="form-control mb-2"
                value={form.image}
                onChange={(event) => setForm({ ...form, image: event.target.value })}
                placeholder="Paste image URL or upload below"
              />
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(event) => setImageFile(event.target.files[0])}
              />
              {uploading && <small className="text-muted">Uploading...</small>}
            </div>
            <div className="col-12">
              <label className="form-label">About</label>
              <textarea
                className="form-control"
                rows="2"
                value={form.about}
                onChange={(event) => setForm({ ...form, about: event.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Adding..." : "Add Vehicle"}
              </button>
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
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car._id}>
                    <td className="text-capitalize">{car.vehicleType || "car"}</td>
                    <td>{car.name}</td>
                    <td>{car.numberPlate || "--"}</td>
                    <td>{car.color || "--"}</td>
                    <td>{car.model}</td>
                    <td>{car.year}</td>
                    <td>₹{car.price}</td>
                  </tr>
                ))}
                {cars.length === 0 && (
                  <tr>
                    <td colSpan="7">No vehicles found</td>
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
            disabled={loadingBookings}
          >
            Refresh
          </button>
        </div>
        <div className="card-body table-responsive">
          {loadingBookings ? (
            <p>Loading bookings...</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Start</th>
                  <th>Return</th>
                  <th>Status</th>
                  <th>Tracking</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking?.user?.email}</td>
                    <td>{booking?.car?.name}</td>
                    <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                    <td>{new Date(booking.returnDate).toLocaleDateString()}</td>
                    <td className="text-capitalize">{booking.status}</td>
                    <td>
                      <span
                        className={`badge ${
                          booking?.liveLocation?.sharingEnabled ? "text-bg-success" : "text-bg-secondary"
                        }`}
                      >
                        {booking?.liveLocation?.sharingEnabled ? "Live" : hasLocation(booking) ? "Last known" : "No signal"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => setTrackedBookingId(booking._id)}
                      >
                        Track
                      </button>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
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
