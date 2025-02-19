// src/components/CompassControl.jsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const CompassControl = () => {
  const map = useMap();

  useEffect(() => {
    // Create a custom control
    const compassControl = L.control({ position: "topleft" });

    compassControl.onAdd = function () {
      const div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-compass-control");
      div.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
      div.style.padding = "4px";
      div.style.borderRadius = "4px";
      div.style.fontSize = "12px";
      div.innerHTML = "🧭"; // You can use an emoji or your own icon/image here
      return div;
    };

    compassControl.addTo(map);

    return () => {
      compassControl.remove();
    };
  }, [map]);

  return null;
};

export default CompassControl;
