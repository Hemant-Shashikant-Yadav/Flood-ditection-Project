import React, { useEffect, useRef, useState } from "react";

interface EmergencyMapProps {
  onLocationData: (data: string) => void; // Callback to send location data
}

const EmergencyMap: React.FC<EmergencyMapProps> = ({ onLocationData }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = async (latitude: number, longitude: number) => {
      const { Map } = (await google.maps.importLibrary(
        "maps"
      )) as google.maps.MapsLibrary;
      const { Place, SearchNearbyRankPreference } =
        (await google.maps.importLibrary(
          "places"
        )) as google.maps.PlacesLibrary;
      const { AdvancedMarkerElement } = (await google.maps.importLibrary(
        "marker"
      )) as google.maps.MarkerLibrary;
      const { LatLngBounds } = (await google.maps.importLibrary(
        "core"
      )) as google.maps.CoreLibrary;

      const center = new google.maps.LatLng(latitude, longitude);

      const mapInstance = new Map(mapRef.current as HTMLElement, {
        center: center,
        zoom: 15,
        mapId: "DEMO_MAP_ID",
      });

      setMap(mapInstance);

      const types = ["hospital"];
      const allPlaces: any[] = [];

      for (const type of types) {
        const request = {
          fields: ["displayName", "location", "businessStatus"],
          locationRestriction: {
            center: center,
            radius: 1000,
          },
          includedPrimaryTypes: [type],
          maxResultCount: 5,
          rankPreference: SearchNearbyRankPreference.POPULARITY,
          language: "en-US",
          region: "in",
        };

        //@ts-ignore
        const { places } = await Place.searchNearby(request);

        if (places.length) {
          allPlaces.push(...places);
        }
      }

      if (allPlaces.length) {
        const bounds = new LatLngBounds();
        const resultsContainer = document.getElementById("results");

        if (resultsContainer) {
          resultsContainer.innerHTML = ""; // Clear previous results
        }

        const locationDetails: string[] = [];

        allPlaces.forEach((place) => {
          const markerView = new AdvancedMarkerElement({
            map: mapInstance,
            position: place.location,
            title: place.displayName,
          });

          bounds.extend(place.location as google.maps.LatLng);

          // Add the place to the results list
          const placeElement = document.createElement("div");
          placeElement.className = "place-item";
          const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${place.Eg.location.lat},${place.Eg.location.lng}`;
          placeElement.innerHTML = `
            <strong>${place.displayName}</strong><br>
            ${place.businessStatus || "Status not available"}<br>
            <a href="${googleMapsLink}" target="_blank" style="color: blue; text-decoration: underline;">Open in Google Maps</a>
          `;
          if (resultsContainer) {
            resultsContainer.appendChild(placeElement);
          }

          // Collect location details
          locationDetails.push(
            `${place.displayName} (${
              place.businessStatus || "Status not available"
            })`
          );
        });

        // Send location details to the parent component
        onLocationData(locationDetails.join("\n"));

        mapInstance.fitBounds(bounds);
      } else {
        console.log("No results");
      }
    };

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          initMap(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to a default location if geolocation fails
          initMap(16.8476345, 74.579861);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Fallback to a default location
      initMap(16.8476345, 74.579861);
    }
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <div ref={mapRef} id="map" style={{ height: "50%", width: "100%" }}></div>
      <div
        id="results"
        style={{
          padding: "10px",
          borderTop: "1px solid #ccc",
          backgroundColor: "#fff",
          overflowY: "auto", // Enable vertical scrolling
          maxHeight: "50%", // Limit the height to make it scrollable
        }}
      >
        {/* Results will be listed here */}
      </div>
    </div>
  );
};

export default EmergencyMap;
