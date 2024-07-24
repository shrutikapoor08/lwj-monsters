import React from "react";
import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

import "./App.css";

const isMarkerNearby = (position) => {
  const threshold = 0.001; // Adjust this value as needed (distance threshold)
  return locations.some(
    (marker) =>
      Math.abs(marker.position.lat - position.lat) < threshold &&
      Math.abs(marker.position.lng - position.lng) < threshold
  );
};

const makeKeyOutOfPosition = ({ lat, lng }) => {
  const latRounded = Math.round(lat * 100) / 100000;
  const lngRounded = Math.round(lng * 100) / 100000;

  const key = `${latRounded}${lngRounded}`;
  console.log({ key });
  return key;
};

const locations = [];

const ShowMonster = ({ position, name, imageUrl }) => {
  const key = makeKeyOutOfPosition({ lat: position.lat, lng: position.lng });
  console.log({ key });
  return (
    <div className="monster-profile">
      <h2>Monster {name} Spotted! </h2>
      <img src={imageUrl} alt={imageUrl} />
    </div>
  );
};

const NewMonster = ({ imageUrl, name }) => {
  return (
    <div className="monster-profile">
      <h2>Monster {name} Spotted! </h2>
      <img src={imageUrl} alt={imageUrl} />
    </div>
  );
};

const PoiMarkers = (props) => {
  return (
    <>
      {props.pois?.map((poi) => (
        <AdvancedMarker
          key={poi?._id}
          position={{ lat: poi?.lat, lng: poi?.lng }}
        >
          <Pin
            background={"#9CFF00"}
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
  const [monsters, setMonsters] = useState([]);

  const getMonsters = useQuery(api.monsters.get);
  const createMonster = useMutation(api.monsters.createMonster);

  const [showNewMonster, setShowNewMonster] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCurrentPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }, []);

  useEffect(() => {
    if (getMonsters?.length > 0) {
      alert("new monster spotted");
      const newestMonster = getMonsters[0];
      setImageUrl(newestMonster.imageUrl);
      setName(newestMonster.name);
      setSomeContent("");
    }
  }, [getMonsters?.length]);

  console.log(getMonsters);

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

    createMonster({
      lat: markerPosition.lat,
      lng: markerPosition.lng,
      name,
      imageUrl,
      key: makeKeyOutOfPosition(markerPosition.lat, markerPosition.lng),
    });
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
      lat: marker?.lat,
      lng: marker?.lng,
    });
  };

  const markerPositionHasContent = (markerPosition) => {
    const necessaryLocation = getMonsters.find((location) => {
      const locationLat = Math.round(location.lat * 100) / 10000;
      const locationLng = Math.round(location.lng * 100) / 10000;
      const markerLat = Math.round(markerPosition.lat * 100) / 10000;
      const markerLng = Math.round(markerPosition.lng * 100) / 10000;

      if (locationLat === markerLat && locationLng === markerLng) {
        console.log("yes matched!!!!!");
        return markerPosition;
      }
    });

    console.log({ necessaryLocation });
    return necessaryLocation;
  };

  return (
    <APIProvider
      apiKey={}
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
        <PoiMarkers pois={getMonsters} />
        {currentPosition?.lat && <AdvancedMarker position={currentPosition} />}

        {showInfoWindow && (
          <InfoWindow
            className="info-window"
            position={markerPosition}
            onCloseClick={handleInfoWindowClose}
          >
            <div>
              {markerPositionHasContent(markerPosition) ? (
                <ShowMonster
                  position={markerPosition}
                  name={markerPositionHasContent(markerPosition)?.name}
                  imageUrl={markerPositionHasContent(markerPosition)?.imageUrl}
                />
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
