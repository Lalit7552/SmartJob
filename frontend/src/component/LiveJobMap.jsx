import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { getSocketUrl } from "../api/chatApi";

const LOCATION_EMIT_MS = 3000;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function getAuthToken(role) {
  return role === "employer"
    ? localStorage.getItem("employerAuthToken")
    : localStorage.getItem("workerAuthToken");
}

function AutoFit({ my, peer }) {
  const map = useMap();
  useEffect(() => {
    if (my && peer) {
      const bounds = L.latLngBounds([my, peer]);
      map.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 0.6 });
      return;
    }
    if (my) {
      map.setView(my, 15, { animate: true, duration: 0.6 });
      return;
    }
    if (peer) {
      map.setView(peer, 15, { animate: true, duration: 0.6 });
    }
  }, [map, my, peer]);
  return null;
}

export default function LiveJobMap({ jobId, role, active, height = 240 }) {
  const [status, setStatus] = useState("");
  const [permissionError, setPermissionError] = useState("");
  const [myLocation, setMyLocation] = useState(null);
  const [peerLocation, setPeerLocation] = useState(null);
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);
  const jobIdRef = useRef(jobId);

  useEffect(() => {
    jobIdRef.current = jobId;
  }, [jobId]);

  useEffect(() => {
    if (!active || !jobId) return;
    const token = getAuthToken(role);
    if (!token) {
      setStatus("Missing auth token");
      return;
    }

    const socket = io(getSocketUrl(), { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("Connected");
      socket.emit("job:join", { jobId });
    });

    socket.on("job:joined", () => setStatus("Live tracking"));

    socket.on("job:location", (payload) => {
      if (!payload || payload.jobId !== jobIdRef.current) return;
      if (payload.actor === role) return;
      const next = {
        lat: Number(payload.lat),
        lng: Number(payload.lng),
        accuracy: Number.isFinite(payload.accuracy) ? Number(payload.accuracy) : null,
        heading: Number.isFinite(payload.heading) ? Number(payload.heading) : null,
        speed: Number.isFinite(payload.speed) ? Number(payload.speed) : null,
        ts: payload.ts || Date.now(),
      };
      if (!Number.isFinite(next.lat) || !Number.isFinite(next.lng)) return;
      setPeerLocation(next);
    });

    socket.on("job:stopped", (payload) => {
      if (!payload || payload.jobId !== jobIdRef.current) return;
      setStatus(payload.reason ? `Tracking stopped: ${payload.reason}` : "Tracking stopped");
    });

    socket.on("job:error", (payload) => {
      setStatus(payload?.message || "Tracking error");
    });

    socket.on("disconnect", () => {
      setStatus("Disconnected");
    });

    return () => {
      socket.emit("job:leave", { jobId: jobIdRef.current });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [active, jobId, role]);

  useEffect(() => {
    if (!active || !jobId) return;
    if (!("geolocation" in navigator)) {
      setPermissionError("Geolocation not supported in this browser.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          ts: pos.timestamp || Date.now(),
        };
        setMyLocation(coords);

        const now = Date.now();
        if (now - lastSentRef.current >= LOCATION_EMIT_MS && socketRef.current?.connected) {
          socketRef.current.emit("job:location", {
            jobId,
            lat: coords.lat,
            lng: coords.lng,
            accuracy: coords.accuracy,
            heading: coords.heading,
            speed: coords.speed,
            ts: coords.ts,
          });
          lastSentRef.current = now;
        }
      },
      (err) => {
        setPermissionError(err?.message || "Location permission denied.");
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
    };
  }, [active, jobId]);

  const center = useMemo(() => {
    if (myLocation) return [myLocation.lat, myLocation.lng];
    if (peerLocation) return [peerLocation.lat, peerLocation.lng];
    return [20.5937, 78.9629];
  }, [myLocation, peerLocation]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
        <span>Live Location</span>
        <span className="text-slate-400">{status || "Connecting..."}</span>
      </div>
      {permissionError && (
        <div className="text-[11px] font-semibold text-rose-500 mb-2">{permissionError}</div>
      )}
      <div className="rounded-2xl overflow-hidden border border-slate-200">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AutoFit
            my={myLocation ? [myLocation.lat, myLocation.lng] : null}
            peer={peerLocation ? [peerLocation.lat, peerLocation.lng] : null}
          />
          {myLocation && (
            <>
              <Marker position={[myLocation.lat, myLocation.lng]}>
                <Popup>You</Popup>
              </Marker>
              {Number.isFinite(myLocation.accuracy) && (
                <Circle
                  center={[myLocation.lat, myLocation.lng]}
                  radius={Math.min(Math.max(myLocation.accuracy, 10), 80)}
                  pathOptions={{ color: "#2563eb", fillColor: "#93c5fd", fillOpacity: 0.2 }}
                />
              )}
            </>
          )}
          {peerLocation && (
            <>
              <Marker position={[peerLocation.lat, peerLocation.lng]}>
                <Popup>{role === "worker" ? "Employer" : "Worker"}</Popup>
              </Marker>
              {Number.isFinite(peerLocation.accuracy) && (
                <Circle
                  center={[peerLocation.lat, peerLocation.lng]}
                  radius={Math.min(Math.max(peerLocation.accuracy, 10), 80)}
                  pathOptions={{ color: "#f97316", fillColor: "#fed7aa", fillOpacity: 0.2 }}
                />
              )}
            </>
          )}
        </MapContainer>
      </div>
      <p className="text-[10px] text-slate-400 mt-2">
        Location updates every few seconds while the job is active.
      </p>
    </div>
  );
}
