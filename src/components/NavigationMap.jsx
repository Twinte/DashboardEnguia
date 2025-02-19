// src/components/NavigationMap.jsx
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaCompass } from "react-icons/fa";

// Fix for default Leaflet icon paths (if needed)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

/**
 * Custom hook to animate a heading value (in degrees) from its previous value to a new target value.
 * It handles angle wrap-around (i.e. 0 and 360 are equivalent).
 * @param {number} target - The new heading (in degrees).
 * @param {number} duration - Animation duration in ms.
 * @returns {number} - The current animated heading.
 */
function useAnimatedHeading(target, duration = 500) {
  const [heading, setHeading] = useState(target);
  const prevHeadingRef = useRef(target);

  useEffect(() => {
    let start = null;
    const initial = prevHeadingRef.current;
    let diff = target - initial;
    // Normalize the difference to the range [-180, 180]
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const animate = (timestamp) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      setHeading(initial + diff * progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevHeadingRef.current = target;
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return heading;
}

const NavigationMap = ({ heading }) => {
  // Get an animated heading using our custom hook
  const animatedHeading = useAnimatedHeading(heading, 500);

  // Define center coordinates and zoom level for the map
  const center = [51.505, -0.09]; // (Example coordinates; adjust as needed)
  const zoom = 10;

  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      {/* Left Column: Compass (occupies 40% of the width) */}
      <div
        style={{
          width: "40%",
          backgroundColor: "#333",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div style={{ transform: `rotate(${animatedHeading}deg)` }}>
          <FaCompass size={100} color="#fff" />
        </div>
      </div>
      {/* Right Column: Map (occupies 60% of the width) */}
      <div style={{ width: "60%", height: "100%" }}>
        <MapContainer center={center} zoom={zoom} style={{ width: "100%", height: "100%" }}>
          {/* Base Layer: OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Overlay: OpenSeaMap */}
          <TileLayer
            attribution='Map data: &copy; <a href="https://www.openseamap.org/">OpenSeaMap</a> contributors'
            url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
          />
          {/* Example Marker */}
          <Marker position={center}>
            <Popup>You are here!</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default NavigationMap;
