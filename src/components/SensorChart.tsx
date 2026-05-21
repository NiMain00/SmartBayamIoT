import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import { SensorData } from '../types';

interface SensorChartProps {
  data: SensorData[];
}

const SensorChart = ({ data }: SensorChartProps) => {
  const chartData = [...data]
    .sort((a, b) => a.id - b.id) 
    .slice(-24)                  
    .map((item) => ({
      id: item.id, 
      waktu: item.waktu.substring(11, 16),
      kelembapanTanah: item.kelembapanTanah,
      kelembapanUdara: item.kelembapanUdara,
      suhuUdara: item.suhuUdara,
      kecerahan: item.kecerahan / 10,
    }));

  return (
    <div className="space-y-6">
      {/* Kelembapan Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Grafik Kelembapan (%)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTanah" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorUdara" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            
            <XAxis 
              dataKey="id" 
              tickFormatter={(id) => {
                const item = chartData.find(d => d.id === id);
                return item ? item.waktu : '';
              }}
              angle={-45} 
              textAnchor="end" 
              interval={0} 
              tick={{ fontSize: 10 }} 
              stroke="#9ca3af" 
            />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[0, 100]} />
            
            <Tooltip
              shared={false}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="kelembapanTanah"
              name="Kelembapan Tanah"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorTanah)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="kelembapanUdara"
              name="Kelembapan Udara"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorUdara)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Suhu & Kecerahan Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Grafik Suhu (°C) & Kecerahan (Lux/10)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            
            <XAxis 
              dataKey="id" 
              tickFormatter={(id) => {
                const item = chartData.find(d => d.id === id);
                return item ? item.waktu : '';
              }}
              angle={-45} 
              textAnchor="end" 
              interval={0} 
              tick={{ fontSize: 10 }} 
              stroke="#9ca3af" 
            />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
            
            <Tooltip
              shared={false}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="suhuUdara"
              name="Suhu Udara (°C)"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="kecerahan"
              name="Kecerahan (Lux/10)"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorChart;