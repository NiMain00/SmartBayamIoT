import { Droplets, Thermometer, Sun, Waves } from 'lucide-react';
import { SensorData } from '../types';

interface SensorCardProps {
  data: SensorData;
}

const SensorCard = ({ data }: SensorCardProps) => {
  const sensors = [
    {
      label: 'Kelembapan Tanah',
      value: data.kelembapanTanah,
      unit: '%',
      icon: Waves,
      gradient: 'from-blue-500 to-cyan-400',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700',
      getStatus: (v: number) => v < 40 ? 'Kering - Irigasi Diperlukan!' : v > 80 ? 'Basah' : 'Normal',
      getStatusColor: (v: number) => v < 40 ? 'text-red-500 font-bold' : v > 80 ? 'text-blue-500' : 'text-green-500',
    },
    {
      label: 'Kelembapan Udara',
      value: data.kelembapanUdara,
      unit: '%',
      icon: Droplets,
      gradient: 'from-indigo-500 to-purple-400',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      getStatus: (v: number) => v < 50 ? 'Rendah' : v > 85 ? 'Tinggi' : 'Normal',
      getStatusColor: (v: number) => v < 50 ? 'text-orange-500' : v > 85 ? 'text-blue-500' : 'text-green-500',
    },
    {
      label: 'Suhu Udara',
      value: data.suhuUdara,
      unit: '°C',
      icon: Thermometer,
      gradient: 'from-red-500 to-orange-400',
      bgLight: 'bg-red-50',
      textColor: 'text-red-700',
      getStatus: (v: number) => v < 20 ? 'Dingin' : v > 35 ? 'Panas' : 'Normal',
      getStatusColor: (v: number) => v < 20 ? 'text-blue-500' : v > 35 ? 'text-red-500' : 'text-green-500',
    },
    {
      label: 'Kecerahan',
      value: data.kecerahan,
      unit: 'Lux',
      icon: Sun,
      gradient: 'from-yellow-500 to-amber-400',
      bgLight: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      getStatus: (v: number) => v < 300 ? 'Redup' : v > 800 ? 'Terang' : 'Normal',
      getStatusColor: (v: number) => v < 300 ? 'text-gray-500' : v > 800 ? 'text-yellow-500' : 'text-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {sensors.map((sensor) => {
        const Icon = sensor.icon;
        const percentage = sensor.unit === '%'
        ? sensor.value
        : sensor.label === 'Suhu Udara'
        ? Math.min(((sensor.value - 0) / (50 - 0)) * 100, 100)
        : Math.min((sensor.value / 1000) * 100, 100);
        return (
          <div
            key={sensor.label}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
          >
            <div className={`bg-gradient-to-r ${sensor.gradient} px-5 py-3`}>
              <div className="flex items-center justify-between text-white">
                <span className="text-sm font-medium opacity-90">{sensor.label}</span>
                <Icon className="w-5 h-5 opacity-80" />
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-800">
                    {sensor.value}
                    <span className="text-lg font-normal text-gray-400 ml-1">{sensor.unit}</span>
                  </div>
                  <div className={`mt-1 text-sm font-medium ${sensor.getStatusColor(sensor.value)}`}>
                    Status: {sensor.getStatus(sensor.value)}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${sensor.gradient} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SensorCard;
