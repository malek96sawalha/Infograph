import React, { useState, useEffect } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { Icon } from "leaflet";

function Map() {
  const [pointers, setpointers] = useState([]);
  const [newpointer, setNewpointer] = useState({
    lat: "",
    lan: "",
    name: "",
    note: "",
  });
  const [selectedpointer, setSelectedpointer] = useState({
    lat: "",
    lan: "",
    name: "",
    note: "",
  });
  const position = [31.9516, 35.93935];
  const [draggable, setDraggable] = useState(false);
  const toggleDraggable = () => {
    setDraggable((d) => !d);
  };
  const [movingposition, setMovingPosition] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3500/pointer").then((response) => {
      setpointers(response.data.data);
    });
  }, []);

  const eventHandlers = {
    dragend(event) {
      const latLng = event.target.getLatLng();
      setMovingPosition(latLng);
      setSelectedpointer((prevState) => ({
        ...prevState,
        lat: latLng.lat,
        lan: latLng.lng,
      }));
    },
  };

  const customIcon = new Icon({
    iconUrl:
      "https://play-lh.googleusercontent.com/5WifOWRs00-sCNxCvFNJ22d4xg_NQkAODjmOKuCQqe57SjmDw8S6VOSLkqo6fs4zqis",
    iconSize: [38, 38],
  });

  const handleDeletepointer = (id) => {
    console.log("delete id");
    console.log(id);

    axios
      .delete(`http://localhost:3500/pointer/${id}`)
      .then(() => {
        setpointers(pointers.filter((pointer) => pointer.ID !== id));
      })
      .catch((error) => {
        console.error("Error deleting pointer:", error);
      });
  };

  const handleSelectedpointer = (pointer) => {
    setSelectedpointer({
      ID: pointer.ID,
      lat: pointer.lat,
      lan: pointer.lan,
      name: pointer.name,
      note: pointer.note,
    });
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const lat = e.latlng.lat;
        const lan = e.latlng.lng;
        setNewpointer({ ...newpointer, lat, lan });
      },
    });
    return false;
  };

  const handleAddpointer = async () => {
    if (newpointer.lat === "" || newpointer.lan === "") {
      alert("Please click on the map to set the latitude and longitude.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3500/pointer",
        newpointer
      );

      setpointers([...pointers, response.data.pointer]);

      setNewpointer({ lat: "", lan: "", name: "", note: "" });
    } catch (error) {
      console.error("Error adding pointer:", error);
    }
  };

  const handleUpdatepointer = async () => {
    try {
      await axios.put(
        `http://localhost:3500/pointer/${selectedpointer.ID}`,
        selectedpointer
      );

      setpointers((prevpointers) =>
        prevpointers.map((pointer) =>
          pointer.ID === selectedpointer.ID ? selectedpointer : pointer
        )
      );

      setSelectedpointer(null);
      setMovingPosition(null);
    } catch (error) {
      console.error("Error updating pointer:", error);
    }
  };

  return (
    <div>
      <MapContainer
        center={position}
        zoom={22}
        scrollWheelZoom={true}
        style={{ height: "700px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pointers.map((pointer) => (
          <Marker
            key={pointer.ID}
            position={
              movingposition ? movingposition : [pointer.lat, pointer.lan]
            }
            icon={customIcon}
            draggable={draggable}
            eventHandlers={eventHandlers}
          >
            <Popup>
              <div>
                <p>Name: {pointer.name}</p>
                <p>Note: {pointer.note}</p>
                <button onClick={() => handleDeletepointer(pointer.ID)}>
                  Delete
                </button>
                <button
                  onClick={() => {
                    handleSelectedpointer(pointer);
                    toggleDraggable();
                  }}
                >
                  Update
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapEvents />
      </MapContainer>
      <form>
        <input
          type="text"
          placeholder="Latitude"
          value={newpointer.lat}
          onChange={(e) => setNewpointer({ ...newpointer, lat: e.target.value })}
        />
        <input
          type="text"
          placeholder="Longitude"
          value={newpointer.lan}
          onChange={(e) => setNewpointer({ ...newpointer, lan: e.target.value })}
        />
        <input
          type="text"
          placeholder="Name"
          value={newpointer.name}
          onChange={(e) => setNewpointer({ ...newpointer, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Note"
          value={newpointer.note}
          onChange={(e) => setNewpointer({ ...newpointer, note: e.target.value })}
        />
        <button type="button" onClick={handleAddpointer}>
          Add pointer
        </button>
      </form>
      <form>
        <input
          type="text"
          placeholder="Latitude"
          value={selectedpointer ? selectedpointer.lat : ""}
          onChange={(e) =>
            setSelectedpointer({ ...selectedpointer, lat: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Longitude"
          value={selectedpointer ? selectedpointer.lan : ""}
          onChange={(e) =>
            setSelectedpointer({ ...selectedpointer, lan: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Name"
          value={selectedpointer ? selectedpointer.name : ""}
          onChange={(e) =>
            setSelectedpointer({ ...selectedpointer, name: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Note"
          value={selectedpointer ? selectedpointer.note : ""}
          onChange={(e) =>
            setSelectedpointer({ ...selectedpointer, note: e.target.value })
          }
        />
        <button type="button" onClick={handleUpdatepointer}>
          Update pointer
        </button>
      </form>
    </div>
  );
}

export default Map;
