import React from "react";

const MAP_PADDING = 0.015;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getMapSrc = (latitude, longitude) => {
  const south = clamp(latitude - MAP_PADDING, -90, 90);
  const north = clamp(latitude + MAP_PADDING, -90, 90);
  const west = clamp(longitude - MAP_PADDING, -180, 180);
  const east = clamp(longitude + MAP_PADDING, -180, 180);

  return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${latitude}%2C${longitude}`;
};

const LiveLocationMap = ({
  latitude,
  longitude,
  title = "Live location",
  height = 320,
}) => {
  const hasLocation =
    Number.isFinite(latitude) && Number.isFinite(longitude);

  if (!hasLocation) {
    return (
      <div className="alert alert-light border mb-0">
        Live location has not been shared yet.
      </div>
    );
  }

  const mapSrc = getMapSrc(latitude, longitude);
  const externalMapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="border rounded overflow-hidden bg-white">
      <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
        <strong>{title}</strong>
        <a
          href={externalMapUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm btn-outline-dark"
        >
          Open in Maps
        </a>
      </div>
      <iframe
        title={title}
        src={mapSrc}
        width="100%"
        height={height}
        loading="lazy"
        style={{ border: 0 }}
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default LiveLocationMap;
