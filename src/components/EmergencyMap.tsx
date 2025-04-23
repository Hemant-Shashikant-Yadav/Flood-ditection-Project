import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Guitar as Hospital,
  FireExtinguisher as FireEngine,
  Slice as Police,
  School,
  Building,
  Bus,
  AlertTriangle,
} from "lucide-react";

// Define types for our emergency locations
interface EmergencyLocation {
  id: string;
  name: string;
  position: google.maps.LatLngLiteral;
  type:
    | "hospital"
    | "fire"
    | "police"
    | "shelter"
    | "school"
    | "community"
    | "government"
    | "transport";
  contact?: string;
  address?: string;
}

const EmergencyMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [activeInfoWindow, setActiveInfoWindow] =
    useState<google.maps.InfoWindow | null>(null);
  const [floodOverlay, setFloodOverlay] =
    useState<google.maps.GroundOverlay | null>(null);

  // Sample emergency locations (in real app, this would come from an API)
  const emergencyLocations: EmergencyLocation[] = [
    {
      id: "1",
      name: "Central Hospital",
      position: { lat: 40.7128, lng: -74.006 },
      type: "hospital",
      contact: "+1 (555) 123-4567",
      address: "123 Medical Drive",
    },
    // Add more locations as needed
  ];

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      const { Map } = (await google.maps.importLibrary(
        "maps"
      )) as google.maps.MapsLibrary;

      const mapInstance = new Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
        zoom: 12,
        styles: mapStyles,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
      });

      setMap(mapInstance);

      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(pos);
            mapInstance.setCenter(pos);
          },
          () => {
            console.error("Error: The Geolocation service failed.");
          }
        );
      }
    };

    initMap();
  }, []);

  // Add markers when map is ready
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    emergencyLocations.forEach((location) => {
      const marker = new google.maps.Marker({
        position: location.position,
        map,
        title: location.name,
        icon: getMarkerIcon(location.type),
      });

      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(location),
      });

      marker.addListener("click", () => {
        activeInfoWindow?.close();
        infoWindow.open(map, marker);
        setActiveInfoWindow(infoWindow);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Add user location marker if available
    if (userLocation) {
      new google.maps.Marker({
        position: userLocation,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Your Location",
      });
    }

    // Add flood overlay
    const floodImageBounds = {
      north: 40.7828,
      south: 40.6428,
      east: -73.906,
      west: -74.106,
    };

    const overlay = new google.maps.GroundOverlay(
      "https://example.com/flood-overlay.png", // Replace with actual flood overlay image
      floodImageBounds,
      {
        opacity: 0.5,
      }
    );

    overlay.setMap(map);
    setFloodOverlay(overlay);

    return () => {
      markers.forEach((marker) => marker.setMap(null));
      floodOverlay?.setMap(null);
    };
  }, [map, userLocation]);

  const getMarkerIcon = (type: EmergencyLocation["type"]) => {
    const icons = {
      hospital: { url: createSVGIcon(Hospital, "#ef4444") },
      fire: { url: createSVGIcon(FireEngine, "#f97316") },
      police: { url: createSVGIcon(Police, "#3b82f6") },
      shelter: { url: createSVGIcon(Building, "#22c55e") },
      school: { url: createSVGIcon(School, "#8b5cf6") },
      community: { url: createSVGIcon(Building, "#6366f1") },
      government: { url: createSVGIcon(Building, "#64748b") },
      transport: { url: createSVGIcon(Bus, "#0ea5e9") },
    };
    return icons[type];
  };

  const createSVGIcon = (Icon: any, color: string) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24">
        ${Icon}
      </svg>
    `;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  };

  const createInfoWindowContent = (location: EmergencyLocation) => {
    return `
      <div class="p-4 max-w-xs">
        <h3 class="text-lg font-semibold mb-2">${location.name}</h3>
        ${
          location.address
            ? `<p class="text-gray-600 mb-1">${location.address}</p>`
            : ""
        }
        ${
          location.contact
            ? `<p class="text-blue-600">${location.contact}</p>`
            : ""
        }
      </div>
    `;
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs"
      >
        <h3 className="font-semibold mb-2">Map Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Hospital className="w-5 h-5 text-red-500" />
            <span>Hospitals</span>
          </div>
          <div className="flex items-center gap-2">
            <FireEngine className="w-5 h-5 text-orange-500" />
            <span>Fire Stations</span>
          </div>
          <div className="flex items-center gap-2">
            <Police className="w-5 h-5 text-blue-500" />
            <span>Police Stations</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-green-500" />
            <span>Emergency Shelters</span>
          </div>
        </div>
      </motion.div>

      {/* Flood Alert */}
      {userLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-3"
        >
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h4 className="font-semibold">High Flood Risk Alert</h4>
            <p className="text-sm">
              Please follow evacuation routes to nearest emergency shelter
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Custom map styles
const mapStyles = [
  {
    featureType: "water",
    elementType: "geometry",
  },
  {
    featureType: "landscape",
    elementType: "geometry",
  },
  // Add more custom styles as needed
];

export default EmergencyMap;
