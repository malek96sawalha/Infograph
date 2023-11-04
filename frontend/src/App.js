import logo from './logo.svg';
import { MapContainer, TileLayer } from 'react-leaflet';
import "leaflet/dist/leaflet.css"
import './App.css';
import Map from './components/Map';

function App() {
  return (
    <Map />
  );
}

export default App;
