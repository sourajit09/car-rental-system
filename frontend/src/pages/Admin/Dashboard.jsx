import React, { useEffect, useState } from "react";
import API from "../../api/API.jsx";
import { toast } from "react-hot-toast";

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
};

const Dashboard = () => {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [form, setForm] = useState(initialCar);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchCars = async () => {
    try {
      setLoadingCars(true);
      const { data } = await API.get("/car/get-allcars");
      setCars(data?.cars || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load cars");
    } finally {
      setLoadingCars(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const { data } = await API.get("/booking/all");
      setBookings(data?.bookings || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchCars();
    fetchBookings();
  }, []);

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
          toast.success("Car updated");
        }
      } else {
        const { data } = await API.post("/car/add-car", payload);
        if (data?.success) {
          toast.success("Car added");
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
        toast.success("Car deleted");
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
        fetchBookings();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Status update failed");
    }
  };

  return (
    <div className="container section-pad">
      <h3 className="mb-4">Admin Dashboard</h3>

      {/* Car form */}
      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          {editingId ? "Edit Car" : "Add New Car"}
        </div>
        <div className="card-body">
          <form className="row g-3" onSubmit={handleCarSubmit}>
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

      {/* Cars table */}
      <div className="card mb-4">
        <div className="card-header bg-dark text-white">Cars</div>
        <div className="card-body table-responsive">
          {loadingCars ? (
            <p>Loading cars...</p>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cars?.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.model}</td>
                    <td>{c.year}</td>
                    <td>₹{c.price}</td>
                    <td className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(c._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {cars?.length === 0 && (
                  <tr>
                    <td colSpan="5">No cars found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bookings table */}
      <div className="card">
        <div className="card-header bg-dark text-white">Bookings</div>
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings?.map((b) => (
                  <tr key={b._id}>
                    <td>{b?.user?.email}</td>
                    <td>{b?.car?.name}</td>
                    <td>{new Date(b.startDate).toLocaleDateString()}</td>
                    <td>{new Date(b.returnDate).toLocaleDateString()}</td>
                    <td className="text-capitalize">{b.status}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={b.status}
                        onChange={(e) =>
                          handleStatusChange(b._id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="confirm">Confirm</option>
                        <option value="cancel">Cancel</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {bookings?.length === 0 && (
                  <tr>
                    <td colSpan="6">No bookings found</td>
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

export default Dashboard;
