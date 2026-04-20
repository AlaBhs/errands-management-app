import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin } from "lucide-react";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "/images/leaflet/marker-icon.png",
  shadowUrl: "/images/leaflet/marker-shadow.png",
});

// Nominatim API endpoints
const NOMINATIM_SEARCH = "/nominatim/search";
const NOMINATIM_REVERSE = "/nominatim/reverse";

interface AddressComponents {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  note?: string;
}

interface AddressMapPickerProps {
  latitude?: number;
  longitude?: number;
  onCoordinatesChange: (lat: number, lng: number) => void;
  onAddressChange: (address: AddressComponents) => void;
  height?: string;
}

interface DraggableMarkerProps {
  position: L.LatLng | null;
  setPosition: (pos: L.LatLng) => void;
  onAddressUpdate: (address: AddressComponents) => void;
}

function DraggableMarker({ position, setPosition, onAddressUpdate }: DraggableMarkerProps) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position && onAddressUpdate) {
      // Reverse geocode when marker is moved
      fetch(
        `${NOMINATIM_REVERSE}?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`
      )
        .then((res) => res.json())
        .then((data) => {
          const addr = data.address;
          onAddressUpdate({
            street: addr.road || addr.pedestrian || "",
            city: addr.city || addr.town || addr.village || "",
            postalCode: addr.postcode || "",
            country: addr.country || "",
          });
        })
        .catch(console.error);
    }
  }, [position, onAddressUpdate]);

  return position ? (
    <Marker
      position={position}
      draggable={true}
      ref={markerRef}
      eventHandlers={{
        dragend: (e) => {
          setPosition(e.target.getLatLng());
        },
      }}
    />
  ) : null;
}

export function AddressMapPicker({
  latitude,
  longitude,
  onCoordinatesChange,
  onAddressChange,
  height = "300px",
}: AddressMapPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    latitude && longitude ? L.latLng(latitude, longitude) : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{
    lat: string;
    lon: string;
    display_name: string;
    address: Record<string, string>;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Center map on Tunisia by default
  const center: L.LatLngExpression = [34.0, 9.0];
  const zoom = 6;

  // Update parent when position changes
  useEffect(() => {
    if (position) {
      onCoordinatesChange(position.lat, position.lng);
    }
  }, [position, onCoordinatesChange]);

  // Search for address suggestions
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      fetch(
        `${NOMINATIM_SEARCH}?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      )
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }, 500);
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: {
    lat: string;
    lon: string;
    display_name: string;
    address: Record<string, string>;
  }) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setPosition(L.latLng(lat, lng));
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);

    // Reverse geocode to get structured address (though suggestion already has address details)
    const addr = suggestion.address;
    onAddressChange({
      street: addr.road || addr.pedestrian || "",
      city: addr.city || addr.town || addr.village || "",
      postalCode: addr.postcode || "",
      country: addr.country || "",
    });
  };

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for an address (e.g., Tunis, Avenue Habib Bourguiba)"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-muted"
                onClick={() => selectSuggestion(s)}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={position || center}
        zoom={position ? 15 : zoom}
        style={{ height, width: "100%", borderRadius: "0.5rem", zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <DraggableMarker
          position={position}
          setPosition={setPosition}
          onAddressUpdate={onAddressChange}
        />
      </MapContainer>

      {/* Optional: show current coordinates */}
      {position && (
        <p className="text-xs text-muted-foreground">
          Coordinates: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}