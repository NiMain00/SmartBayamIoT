import { Copy, Check, Database, Table } from 'lucide-react';
import { useState } from 'react';

const DatabaseSchema = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sqlCreate = `-- Buat Database
CREATE DATABASE IF NOT EXISTS iot_smart_farming;
USE iot_smart_farming;

-- Buat Tabel Sensor Data
CREATE TABLE sensor_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kelembapan_tanah DECIMAL(5,2) NOT NULL,
    kelembapan_udara DECIMAL(5,2) NOT NULL,
    suhu_udara DECIMAL(5,2) NOT NULL,
    kecerahan INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_waktu (waktu),
    INDEX id (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Perangkat ESP32
CREATE TABLE devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_name VARCHAR(100) NOT NULL,
    device_key VARCHAR(255) UNIQUE NOT NULL,
    location_name VARCHAR(200),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Kontrol Solenoid Valve
CREATE TABLE valve_control (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    valve_status ENUM('ON', 'OFF') NOT NULL DEFAULT 'OFF',
    triggered_by ENUM('manual', 'automatic') NOT NULL,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Threshold / Batas Sensor
CREATE TABLE sensor_thresholds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    soil_moisture_min DECIMAL(5,2) DEFAULT 30.00,
    soil_moisture_max DECIMAL(5,2) DEFAULT 80.00,
    air_humidity_min DECIMAL(5,2) DEFAULT 50.00,
    air_humidity_max DECIMAL(5,2) DEFAULT 85.00,
    temperature_min DECIMAL(5,2) DEFAULT 20.00,
    temperature_max DECIMAL(5,2) DEFAULT 35.00,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  const CodeBlock = ({ code, index }: { code: string; index: number }) => (
    <div className="relative group">
      <pre className="bg-gray-900 text-green-400 rounded-xl p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, index)}
        className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copiedIndex === index ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-300" />}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Database Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            Skema Database MySQL
          </h3>
          <p className="text-sm text-gray-500 mt-1">SQL untuk membuat database dan tabel di phpMyAdmin (XAMPP)</p>
        </div>
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <div className="text-sm text-amber-800">
              <strong>💡 Petunjuk:</strong> Buka phpMyAdmin → klik tab "SQL" → paste kode di bawah → klik "Go"
            </div>
          </div>
          <CodeBlock code={sqlCreate} index={0} />
        </div>
      </div>

      {/* Table Structure */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Table className="w-5 h-5 text-blue-500" />
            Struktur Tabel sensor_data
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Field</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Null</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Default</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Extra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-emerald-600">id</td>
                  <td className="px-4 py-3 text-sm text-gray-600">INT</td>
                  <td className="px-4 py-3 text-sm text-gray-600">NO</td>
                  <td className="px-4 py-3 text-sm"><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">PRI</span></td>
                  <td className="px-4 py-3 text-sm text-gray-400">NULL</td>
                  <td className="px-4 py-3 text-sm text-gray-600">auto_increment</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-blue-600">kelembapan_tanah</td>
                  <td className="px-4 py-3 text-sm text-gray-600">DECIMAL(5,2)</td>
                  <td className="px-4 py-3 text-sm text-gray-600">NO</td>
                  <td className="px-4 py-3 text-sm text-gray-400">-</td>
                  <td className="px-4 py-3 text-sm text-gray-400">NULL</td>
                  <td className="px-4 py-3 text-sm text-gray-400">-</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-blue-600">kelembapan_udara</td>
                  <td className="px-4 py-3 text-sm text-gray-600">DECIMAL(5,2)</td>
                  <td className="px-4 py-3 text-sm text-gray-600">NO</td>
                  <td className="px-4 py-3 text-sm text-gray-400">-</td>
                  <td className="px-4 py-3 text-sm text-gray-400">NULL</td>
                  <td className="px-4 py-3 text-sm text-gray-400">-</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-blue-600">suhu_udara</td>
                  <td className="px-4 py-3 text-sm text-gray-600">DECIMAL(5,2)</td>
                  <td className="px-4 py-3 text-sm text-gray-600">NO</td>
                  <td className="px-4 py-3 text-sm text-gray-400">-</td>
                  <td className="px-4 py-3 text-sm text-gray-400">NULL</td>
                  <td className="px-4 py-3 text-sm text-gray-400">-</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-blue-600">kecerahan</td>
                  <td className="px-4 py-3 text-sm text-gray-600">INT</td>
                  <td className="px-4 py-3 text-sm text-gray-600">NO</td>
                  <td className="px-4 py-3 text-sm text-gray-400">-</td>
                  <td className="px-4 py-3 text-sm text-gray-400">NULL</td>
                  <td className="px-4 py-3 text-sm text-gray-400">-</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-blue-600">latitude</td>
                  <td className="px-4 py-3 text-sm text-gray-600">DECIMAL(10,8)</td>
                  <td className="px-4 py-3 text-sm text-gray-600">NO</td>
                  <td className="px-4 py-3 text-sm text-gray-400">-</td>
                  <td className="px-4 py-3 text-sm text-gray-400">NULL</td>
                  <td className="px-4 py-3 text-sm text-gray-400">-</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-blue-600">longitude</td>
                  <td className="px-4 py-3 text-sm text-gray-600">DECIMAL(11,8)</td>
                  <td className="px-4 py-3 text-sm text-gray-600">NO</td>
                  <td className="px-4 py-3 text-sm text-gray-400">-</td>
                  <td className="px-4 py-3 text-sm text-gray-400">NULL</td>
                  <td className="px-4 py-3 text-sm text-gray-400">-</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-blue-600">waktu</td>
                  <td className="px-4 py-3 text-sm text-gray-600">TIMESTAMP</td>
                  <td className="px-4 py-3 text-sm text-gray-600">NO</td>
                  <td className="px-4 py-3 text-sm"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">MUL</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600">CURRENT_TIMESTAMP</td>
                  <td className="px-4 py-3 text-sm text-gray-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ERD Description */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">🔗 Relasi Antar Tabel</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200">
              <div className="font-semibold text-emerald-800 mb-2">📱 devices</div>
              <div className="text-sm text-emerald-700 space-y-1">
                <p>• Menyimpan info perangkat ESP32</p>
                <p>• device_key untuk autentikasi</p>
                <p>• 1 device → banyak sensor_data</p>
                <p>• 1 device → banyak valve_control</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <div className="font-semibold text-blue-800 mb-2">📊 sensor_data</div>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Menyimpan semua data sensor</p>
                <p>• Otomatis timestamp saat insert</p>
                <p>• Index pada waktu untuk query cepat</p>
                <p>• Relasi ke devices via device_id</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
              <div className="font-semibold text-purple-800 mb-2">🔧 valve_control</div>
              <div className="text-sm text-purple-700 space-y-1">
                <p>• Log kontrol solenoid valve</p>
                <p>• Status ON/OFF</p>
                <p>• Trigger manual atau otomatis</p>
                <p>• Relasi ke devices</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
              <div className="font-semibold text-amber-800 mb-2">⚙️ sensor_thresholds</div>
              <div className="text-sm text-amber-700 space-y-1">
                <p>• Batas min/max setiap sensor</p>
                <p>• Digunakan untuk alert otomatis</p>
                <p>• Kontrol valve otomatis</p>
                <p>• Per-device configuration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSchema;
