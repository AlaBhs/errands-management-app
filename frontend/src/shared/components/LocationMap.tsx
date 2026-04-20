import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "/images/leaflet/marker-icon.png",
  shadowUrl: "/images/leaflet/marker-shadow.png",
});

interface LocationMapProps {
  latitude: number;
  longitude: number;
  height?: string;
  zoom?: number;
}

export function LocationMap({ latitude, longitude, height = "200px", zoom = 14 }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([latitude, longitude], zoom);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add marker
    L.marker([latitude, longitude]).addTo(map);

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom]);

  // Update view if coordinates change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], zoom);
      // Clear existing markers and add a new one (or update marker position – simpler to just add new)
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstanceRef.current?.removeLayer(layer);
        }
      });
      L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
    }
  }, [latitude, longitude, zoom]);

  return <div ref={mapRef} style={{ height, width: "100%", borderRadius: "0.5rem", zIndex: 0 }} />;
}