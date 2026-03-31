import React, { useState } from "react";
import API from "../api/API.jsx";
import { toast } from "react-hot-toast";

const EditModal = ({ setEditModal }) => {

  const user = JSON.parse(localStorage.getItem("user"));
  const [uname, setUname] = useState(user?.uname || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [password, setPassword] = useState("");


  const handleUpdate = async () => {
    try {
      const payload = { uname, phone };
      if(password) payload.password = password;

      const { data } = await API.patch(`/user/update/${user?._id}`, payload);
      if(data?.success){
        const newUser = {...user, uname, phone};
        localStorage.setItem("user", JSON.stringify(newUser));
        toast.success("Profile Updated");
        setEditModal(false);
      }else{
        toast.error(data?.message || "Update failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  return (
    <>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header bg-dark text-light">
              <h5 className="modal-title">MANAGE PROFILE</h5>

              <button
                className="btn-close bg-light"
                onClick={() => setEditModal(false)}
              ></button>
            </div>

            <div className="modal-body">

              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={uname}
                  onChange={(e) => setUname(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setEditModal(false)}
              >
                Close
              </button>

              <button
                className="btn btn-primary"
                onClick={handleUpdate}
              >
                UPDATE
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Background overlay */}
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default EditModal;
