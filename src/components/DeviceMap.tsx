import { MapPin, Navigation } from 'lucide-react';
import { SensorData } from '../types';

interface DeviceMapProps {
  data: SensorData;
}

const DeviceMap = ({ data }: DeviceMapProps) => {
  const lat = Number(data.latitude || 0);
  const lng = Number(data.longitude || 0);
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-500" />
          Lokasi Perangkat ESP32
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 rounded-xl p-4">
            <div className="text-sm text-emerald-600 font-medium">Latitude</div>
            <div className="text-xl font-bold text-emerald-800 font-mono">{lat.toFixed(6)}</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-sm text-blue-600 font-medium">Longitude</div>
            <div className="text-xl font-bold text-blue-800 font-mono">{lng.toFixed(6)}</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="text-sm text-purple-600 font-medium">Status</div>
            <div className="text-xl font-bold text-purple-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Online
            </div>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: '300px' }}>
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={mapUrl}
            title="Device Location"
            className="border-0"
          />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-gray-400" />
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Buka di OpenStreetMap ↗
          </a>
        </div>
      </div>
    </div>
  );
};

export default DeviceMap;

