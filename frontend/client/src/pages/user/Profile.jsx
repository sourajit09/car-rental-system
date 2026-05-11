import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import EditModal from "../../components/EditModal";
import BookingDetailsmodal from "../../components/BookingDetailsmodal";
import LiveLocationMap from "../../components/LiveLocationMap.jsx";
import API from "../../api/API.jsx";
import { getStoredToken, getStoredUser } from "../../utils/authStorage.js";
import {
  buildLiveLocationSocketUrl,
  isLiveLocationSocketOpen,
  parseLiveLocationSocketMessage,
} from "../../utils/liveLocationSocket.js";

const LIVE_LOCATION_MIN_PUSH_MS = 3000;
const LIVE_LOCATION_HEARTBEAT_MS = 12000;
const MIN_COORDINATE_DELTA = 0.00003;
const SOCKET_RECONNECT_MS = 2000;

const WATCH_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

const formatGeoError = (error) => {
  if (!error) {
    return "Unable to detect your location.";
  }

  switch (error.code) {
    case 1:
      return "Location permission was denied.";
    case 2:
      return "Location information is unavailable right now.";
    case 3:
      return "Location request timed out.";
    default:
      return "Unable to detect your location.";
  }
};

const hasLocation = (bookingOrLocation) =>
  Number.isFinite(
    Number(bookingOrLocation?.latitude ?? bookingOrLocation?.liveLocation?.latitude)
  ) &&
  Number.isFinite(
    Number(
      bookingOrLocation?.longitude ?? bookingOrLocation?.liveLocation?.longitude
    )
  );

const getSocketStatusMeta = (socketStatus) => {
  switch (socketStatus) {
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

const Profile = () => {
  const [editModal, setEditModal] = useState(false);
  const [bookingDetailsModal, setBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sharingBookingId, setSharingBookingId] = useState(null);
  const [locationBusyId, setLocationBusyId] = useState(null);
  const [mapBookingId, setMapBookingId] = useState(null);
  const [localLocationPreview, setLocalLocationPreview] = useState(null);
  const [socketStatus, setSocketStatus] = useState("connecting");

  const locationWatchRef = useRef(null);
  const lastSentLocationRef = useRef(null);
  const locationRequestInFlightRef = useRef(false);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const user = getStoredUser();

  const updateBookingInState = (updatedBooking) => {
    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking._id === updatedBooking._id ? updatedBooking : booking
      )
    );
    setSelectedBooking((currentBooking) =>
      currentBooking?._id === updatedBooking._id ? updatedBooking : currentBooking
    );
  };

  const stopLocationWatcher = () => {
    if (
      locationWatchRef.current !== null &&
      typeof navigator !== "undefined" &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
    }

    locationWatchRef.current = null;
    lastSentLocationRef.current = null;
    locationRequestInFlightRef.current = false;
  };

  const fetchBookings = async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      const { data } = await API.get("/booking/my");
      const fetchedBookings = data?.bookings || [];
      setBookings(fetchedBookings);
      setMapBookingId((currentMapBookingId) => {
        if (
          currentMapBookingId &&
          fetchedBookings.some((booking) => booking._id === currentMapBookingId)
        ) {
          return currentMapBookingId;
        }

        return fetchedBookings[0]?._id || null;
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (getStoredToken()) {
      fetchBookings();
    }

    return () => {
      stopLocationWatcher();
    };
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    const socketUrl = buildLiveLocationSocketUrl(API.defaults.baseURL, token);

    if (!socketUrl) {
      setSocketStatus("reconnecting");
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
          setSocketStatus("live");
        }
      };

      socket.onmessage = (event) => {
        const message = parseLiveLocationSocketMessage(event);
        if (!message) {
          return;
        }

        if (message.type === "connection") {
          setSocketStatus("live");
          return;
        }

        if (message.type === "booking-location" && message.booking?._id) {
          updateBookingInState(message.booking);
          setMapBookingId((currentMapBookingId) =>
            currentMapBookingId || message.booking._id
          );
          setSocketStatus("live");
        }
      };

      socket.onerror = () => {
        if (isActive) {
          setSocketStatus("reconnecting");
        }
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (!isActive) {
          return;
        }

        setSocketStatus("reconnecting");
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

  useEffect(() => {
    if (
      sharingBookingId &&
      !bookings.some(
        (booking) => booking._id === sharingBookingId && booking.status !== "cancel"
      )
    ) {
      stopLocationWatcher();
      setSharingBookingId(null);
      setLocalLocationPreview(null);
    }
  }, [bookings, sharingBookingId]);

  const requestCurrentPosition = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported in this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, WATCH_OPTIONS);
    });

  const sendSocketMessage = (message) => {
    const socket = socketRef.current;

    if (!isLiveLocationSocketOpen(socket)) {
      return false;
    }

    try {
      socket.send(JSON.stringify(message));
      return true;
    } catch (_error) {
      return false;
    }
  };

  const patchLocationFallback = async (bookingId, payload) => {
    const { data } = await API.patch(`/booking/${bookingId}/location`, payload);
    const updatedBooking = data?.booking;
    if (updatedBooking) {
      updateBookingInState(updatedBooking);
    }
    return updatedBooking;
  };

  const shouldPushLocationUpdate = (nextLocation, force = false) => {
    if (force) {
      return true;
    }

    const previousLocation = lastSentLocationRef.current;
    if (!previousLocation) {
      return true;
    }

    const timeDifference = nextLocation.timestamp - previousLocation.timestamp;
    const latitudeDifference = Math.abs(
      nextLocation.latitude - previousLocation.latitude
    );
    const longitudeDifference = Math.abs(
      nextLocation.longitude - previousLocation.longitude
    );
    const hasMovedEnough =
      latitudeDifference >= MIN_COORDINATE_DELTA ||
      longitudeDifference >= MIN_COORDINATE_DELTA;

    return (
      timeDifference >= LIVE_LOCATION_HEARTBEAT_MS ||
      (hasMovedEnough && timeDifference >= LIVE_LOCATION_MIN_PUSH_MS)
    );
  };

  const syncPositionToServer = async (bookingId, position, { force = false } = {}) => {
    const nextLocation = {
      bookingId,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      updatedAt: new Date().toISOString(),
      timestamp: Date.now(),
    };

    setLocalLocationPreview(nextLocation);

    if (!shouldPushLocationUpdate(nextLocation, force)) {
      return null;
    }

    if (locationRequestInFlightRef.current) {
      return null;
    }

    locationRequestInFlightRef.current = true;

    try {
      const sentOverSocket = sendSocketMessage({
        type: "share-location",
        payload: {
          bookingId,
          latitude: nextLocation.latitude,
          longitude: nextLocation.longitude,
          accuracy: nextLocation.accuracy,
        },
      });

      let updatedBooking = null;
      if (!sentOverSocket) {
        updatedBooking = await patchLocationFallback(bookingId, {
          latitude: nextLocation.latitude,
          longitude: nextLocation.longitude,
          accuracy: nextLocation.accuracy,
          sharingEnabled: true,
        });
      }

      lastSentLocationRef.current = nextLocation;
      return updatedBooking;
    } finally {
      locationRequestInFlightRef.current = false;
    }
  };

  const startSharing = async (bookingId) => {
    if (!bookingId) {
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser.");
      return;
    }

    if (sharingBookingId && sharingBookingId !== bookingId) {
      await stopSharing(sharingBookingId, false);
    }

    stopLocationWatcher();

    try {
      setLocationBusyId(bookingId);

      const firstPosition = await requestCurrentPosition();
      await syncPositionToServer(bookingId, firstPosition, { force: true });

      locationWatchRef.current = navigator.geolocation.watchPosition(
        (position) => {
          syncPositionToServer(bookingId, position).catch((error) => {
            console.log(error);
          });
        },
        (error) => {
          if (error?.code === 1) {
            toast.error(formatGeoError(error));
            stopSharing(bookingId, false).catch((stopError) => {
              console.log(stopError);
            });
          }
        },
        WATCH_OPTIONS
      );

      setSharingBookingId(bookingId);
      setMapBookingId(bookingId);
      toast.success("Realtime location sharing started");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          formatGeoError(error)
      );
      stopLocationWatcher();
    } finally {
      setLocationBusyId(null);
    }
  };

  const stopSharing = async (bookingId, notify = true) => {
    if (!bookingId) {
      return;
    }

    setLocationBusyId(bookingId);
    stopLocationWatcher();
    setSharingBookingId((currentBookingId) =>
      currentBookingId === bookingId ? null : currentBookingId
    );
    setLocalLocationPreview((currentLocation) =>
      currentLocation?.bookingId === bookingId ? null : currentLocation
    );

    try {
      const sentOverSocket = sendSocketMessage({
        type: "stop-sharing",
        payload: { bookingId },
      });

      if (!sentOverSocket) {
        await patchLocationFallback(bookingId, {
          sharingEnabled: false,
        });
      }
      if (notify) {
        toast.success("Realtime location sharing stopped");
      }
    } catch (error) {
      if (notify) {
        toast.error(
          error.response?.data?.message || "Could not stop location sharing"
        );
      }
    } finally {
      setLocationBusyId(null);
    }
  };

  const activeMapBooking =
    bookings.find((booking) => booking._id === mapBookingId) || null;

  const previewLocation =
    localLocationPreview?.bookingId === activeMapBooking?._id
      ? localLocationPreview
      : activeMapBooking?.liveLocation;
  const socketStatusMeta = getSocketStatusMeta(socketStatus);

  return (
    <>
      <div className="container" style={{ minHeight: "70vh" }}>
        <div className="mt-4">
          <p>Name : {user?.uname}</p>
          <p>Email : {user?.email}</p>
          <p>Phone : {user?.phone}</p>

          <button
            className="btn btn-warning"
            onClick={() => setEditModal(true)}
          >
            Edit Details
          </button>
        </div>

        <div className="card mt-4 border-0 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
              <h5 className="mb-0">Realtime safety sharing</h5>
              <span className={`badge ${socketStatusMeta.className}`}>
                {socketStatusMeta.label}
              </span>
            </div>
            <p className="text-muted mb-0">
              This now works over WebSocket like a live delivery tracker: your
              phone watches movement continuously and pushes fresh coordinates
              as you move, while the owner dashboard sees the route update
              instantly. Keep this page open and allow location permission
              while the ride is active.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h4 className="mb-0">Your Bookings</h4>
            <button
              className="btn btn-outline-dark btn-sm"
              onClick={() => fetchBookings(false)}
            >
              Refresh bookings
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered mt-3 text-center">
              <thead className="bg-dark text-white">
                <tr>
                  <th>Car Name</th>
                  <th>Journey Date</th>
                  <th>Status</th>
                  <th>Live Location</th>
                  <th>View Details</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="5">Loading...</td>
                  </tr>
                )}
                {!loading && bookings?.length === 0 && (
                  <tr>
                    <td colSpan="5">No bookings found</td>
                  </tr>
                )}
                {bookings?.map((booking) => {
                  const bookingHasLocation = hasLocation(booking);
                  const isSharingThisBooking = sharingBookingId === booking._id;
                  const isCancelled = booking.status === "cancel";
                  const isBusy = locationBusyId === booking._id;

                  return (
                    <tr key={booking._id}>
                      <td>{booking?.car?.name}</td>
                      <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                      <td className="text-capitalize">{booking.status}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                          {isCancelled ? (
                            <span className="text-muted">Unavailable</span>
                          ) : isSharingThisBooking ? (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => stopSharing(booking._id)}
                              disabled={isBusy}
                            >
                              {isBusy ? "Stopping..." : "Stop Live"}
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => startSharing(booking._id)}
                              disabled={isBusy}
                            >
                              {isBusy ? "Starting..." : "Start Live"}
                            </button>
                          )}

                          <button
                            className="btn btn-sm btn-outline-dark"
                            onClick={() => setMapBookingId(booking._id)}
                          >
                            {bookingHasLocation ? "Preview Map" : "Open Card"}
                          </button>
                        </div>

                        <div className="small text-muted mt-2">
                          {booking.liveLocation?.updatedAt
                            ? `Last update: ${new Date(
                                booking.liveLocation.updatedAt
                              ).toLocaleString()}`
                            : "No location sent yet"}
                        </div>
                      </td>
                      <td>
                        <i
                          className="fa-solid fa-eye text-primary"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setSelectedBooking(booking);
                            setBookingDetailsModal(true);
                          }}
                        ></i>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card mt-4 mb-5">
          <div className="card-header bg-dark text-white">
            Shared Location Preview
          </div>
          <div className="card-body">
            {activeMapBooking ? (
              <>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <div>
                    <strong>{activeMapBooking?.car?.name}</strong>
                    <div className="text-muted small text-capitalize">
                      Status: {activeMapBooking?.status}
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      sharingBookingId === activeMapBooking._id
                        ? "text-bg-success"
                        : activeMapBooking?.liveLocation?.sharingEnabled
                        ? "text-bg-primary"
                        : "text-bg-secondary"
                    }`}
                  >
                    {sharingBookingId === activeMapBooking._id
                      ? "Sharing live"
                      : activeMapBooking?.liveLocation?.sharingEnabled
                      ? "Last known live session"
                      : "Not sharing"}
                  </span>
                </div>

                <LiveLocationMap
                  title={`${activeMapBooking?.car?.name || "Car"} location`}
                  latitude={
                    hasLocation(previewLocation)
                      ? Number(previewLocation.latitude)
                      : undefined
                  }
                  longitude={
                    hasLocation(previewLocation)
                      ? Number(previewLocation.longitude)
                      : undefined
                  }
                  height={340}
                />

                <div className="row g-3 mt-2">
                  <div className="col-md-4">
                    <div className="border rounded p-3 h-100">
                      <strong>Latitude</strong>
                      <div className="text-muted">
                        {hasLocation(previewLocation)
                          ? Number(previewLocation.latitude).toFixed(6)
                          : "--"}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-3 h-100">
                      <strong>Longitude</strong>
                      <div className="text-muted">
                        {hasLocation(previewLocation)
                          ? Number(previewLocation.longitude).toFixed(6)
                          : "--"}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-3 h-100">
                      <strong>Last Update</strong>
                      <div className="text-muted">
                        {previewLocation?.updatedAt
                          ? new Date(previewLocation.updatedAt).toLocaleString()
                          : "--"}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="mb-0 text-muted">
                Select a booking above to preview its shared location.
              </p>
            )}
          </div>
        </div>
      </div>

      {editModal && <EditModal setEditModal={setEditModal} />}

      {bookingDetailsModal && (
        <BookingDetailsmodal
          setBookingDetailsModal={setBookingDetailsModal}
          booking={selectedBooking}
        />
      )}
    </>
  );
};

export default Profile;
