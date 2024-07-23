import React from "react";
import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

import "./App.css";

const isMarkerNearby = (position) => {
  const threshold = 0.001; // Adjust this value as needed (distance threshold)
  return locations.some(
    (marker) =>
      Math.abs(marker.position.lat - position.lat) < threshold &&
      Math.abs(marker.position.lng - position.lng) < threshold
  );
};

const locations = [];

const ShowMonster = ({ name, imageUrl }) => {
  return (
    <div className="monster-profile">
      <h2>Monster {name} Spotted! </h2>
      <img src={imageUrl} alt={imageUrl} />
    </div>
  );
};

const PoiMarkers = (props) => {
  console.log({ props });
  return (
    <>
      {props.pois?.map((poi) => (
        <AdvancedMarker
          key={poi?.key}
          position={{ lat: poi?.lat, lng: poi?.lng }}
        >
          <Pin
            background={"#FBBC04"}
            glyphColor={"#000"}
            borderColor={"#000"}
          />
        </AdvancedMarker>
      ))}
    </>
  );
};

const App = () => {
  const [currentPosition, setCurrentPosition] = useState({});
  const [markerPosition, setMarkerPosition] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [infoContent, setInfoContent] = useState("");
  const [someContent, setSomeContent] = useState("");
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCurrentPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }, []);

  const handleInfoWindowClose = () => {
    setShowInfoWindow(false);
  };

  const handleInputChange = (e) => {
    setInfoContent(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSomeContent({ name: name, url: imageUrl });
    const necessaryLocation = locations.find(
      (location) =>
        location.lat === markerPosition.lat &&
        location.lng === markerPosition.lng
    );

    if (necessaryLocation) {
      necessaryLocation.content = infoContent;
    } else {
      locations.push({
        key: `${markerPosition.lat}${markerPosition.lng}`,
        lat: markerPosition.lat,
        lng: markerPosition.lng,
        name: name,
        url: imageUrl,
      });
    }

    console.log({ necessaryLocation });
    setShowInfoWindow(false);
  };

  const handleMapClick = (event) => {
    setShowInfoWindow(true);
    const marker = {
      lat: event.detail?.latLng.lat,
      lng: event.detail?.latLng.lng,
    };
    setMarkerPosition(marker);
    locations.push({
      key: `${marker.lat}${marker.lng}`,
      lat: marker.lat,
      lng: marker.lng,
    });
  };

  const markerPositionHasContent = () => {
    const necessaryLocation = locations.find(
      (location) =>
        location.lat === markerPosition.lat &&
        location.lng === markerPosition.lng
    );

    return necessaryLocation?.content;
  };

  return (
    <APIProvider
      apiKey={"AIzaSyBcixpd3Uc-ssuYJC4Q8HzovlMGpghyVYc"}
      onLoad={() => console.log("Maps API has loaded.")}
    >
      <Map
        style={{ width: "100vw", height: "100vh" }}
        defaultCenter={currentPosition || { lat: -33.8737375, lng: 151.222569 }}
        defaultZoom={15}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapId="DEMO_MAP_ID"
        onClick={handleMapClick}
      >
        <PoiMarkers pois={locations} />
        {currentPosition.lat && <AdvancedMarker position={currentPosition} />}

        {showInfoWindow && (
          <InfoWindow
            className="info-window"
            position={markerPosition}
            onCloseClick={handleInfoWindowClose}
          >
            <div>
              {someContent ? (
                <ShowMonster name={name} imageUrl={imageUrl} />
              ) : (
                <form onSubmit={handleFormSubmit}>
                  <div>
                    <label htmlFor="name">Name:</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="url">Image URL:</label>
                    <input
                      type="url"
                      id="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit">Save</button>
                </form>
              )}
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
};

export default App;
