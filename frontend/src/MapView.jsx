import { useEffect, useState } from "react";
import { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
 
} from "react-leaflet";

function MapView({ bins = [], route = null }) {
  const defaultCenter = [13.3409, 77.1010];
 
const routePositions = useMemo(() => {
  const positions = [];

  if (
    route?.startLocation?.latitude != null &&
    route?.startLocation?.longitude != null
  ) {
    positions.push([
      Number(route.startLocation.latitude),
      Number(route.startLocation.longitude)
    ]);
  }

  if (route?.stops?.length) {
    route.stops.forEach((stop) => {
      if (stop.latitude != null && stop.longitude != null) {
        positions.push([
          Number(stop.latitude),
          Number(stop.longitude)
        ]);
      }
    });
  }

  return positions;
}, [route]);

const [roadRoute, setRoadRoute] = useState([]);

useEffect(() => {
  const getRoadRoute = async () => {
    if (routePositions.length < 2) {
      setRoadRoute([]);
      return;
    }

    try {
      const coordinates = routePositions
        .map(([lat, lon]) => `${lon},${lat}`)
        .join(";");

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
      );

      if (!response.ok) {
        throw new Error("Road routing request failed");
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const points = data.routes[0].geometry.coordinates.map(
          ([lon, lat]) => [lat, lon]
        );

        setRoadRoute(points);
      } else {
        setRoadRoute([]);
      }
    } catch (error) {
      console.error("Road routing error:", error);
      setRoadRoute([]);
    }
  };

  getRoadRoute();
}, [routePositions]);


  return (
    <div style={{ height: "450px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routePositions.length >= 2 && (
  <Polyline
    positions={roadRoute.length > 1 ? roadRoute : routePositions}
    pathOptions={{
      color: "#2563eb",
      weight: 5,
      opacity: 0.8
    }}
  />
)}

        {bins.map((bin) => {
          const latitude = bin.location?.latitude;
          const longitude = bin.location?.longitude;

          if (latitude == null || longitude == null) return null;

          return (
            <CircleMarker
              key={bin._id}
              center={[latitude, longitude]}
              radius={10}
              pathOptions={{
                color: bin.fillLevel >= 80 ? "red" : "green",
                fillOpacity: 0.8,
              }}
            >
              <Popup>
                <strong>{bin.binId}</strong>
                <br />
                Fill Level: {bin.fillLevel}%
                <br />
                {bin.location.address}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapView;
