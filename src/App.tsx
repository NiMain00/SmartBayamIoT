import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Droplets,
  Table2,
  Server,
  Database,
  Leaf,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  Activity,
  Menu,
  X,
} from 'lucide-react';
import { SensorData, TabType } from './types';
import { fetchSensorData } from './api';

import SensorCard from './components/SensorCard';
import SensorChart from './components/SensorChart';
import DataTable from './components/DataTable';
import ApiDocs from './components/ApiDocs';
import DatabaseSchema from './components/DatabaseSchema';
import ValveControl from './components/ValveControl';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [isOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSensorData(10000, true);
      setSensorData(data);
      setLatestData(data[0]);
      setLastUpdate(new Date().toLocaleTimeString('id-ID'));
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Gagal memuat data sensor. Periksa koneksi backend.');
      setLastUpdate('Error loading data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time updates from API
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const recentData = await fetchSensorData(1, true);
        if (recentData.length > 0) {
          const newData = recentData[0];
          setLatestData(newData);
          setSensorData((prev) => {
            const updated = [...prev.filter(d => d.id !== newData.id), newData];
            return updated.length > 10000 ? updated.slice(0, 10000) : updated;
          });
          setLastUpdate(new Date().toLocaleTimeString('id-ID'));
        }
      } catch (error) {
        console.error('Real-time update error:', error);
      }
}, 5000); // 1 jam

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'valve' as TabType, label: 'Kontrol Katup', icon: Droplets },
    { id: 'data' as TabType, label: 'Data Sensor', icon: Table2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-sl font-bold text-gray-800">Smart Farm Bayam</h1>
                <p className="text-xs text-gray-500">IoT Monitoring</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Device Status */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'ESP32 Online' : 'ESP32 Offline'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Update: {lastUpdate}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Monitoring Sensor ESP32 - Smart Farming System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Activity className="w-4 h-4 text-emerald-500" />
<span>Auto-refresh: 1Hrs</span>
              </div>
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 mb-6 rounded-2xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800 font-medium"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Memuat data sensor...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <WifiOff className="w-10 h-10 text-red-400" />
                </div>
                <p className="text-lg font-medium text-gray-800 mb-2">{error}</p>
                <button
                  onClick={loadData}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Sensor Cards */}
                  {latestData ? <SensorCard data={latestData} /> : null}

                  {/* Charts */}
                  {sensorData.length > 0 ? <SensorChart data={sensorData} /> : null}

                  {/* Quick Data Preview */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">Data Terbaru</h3>
                      <button
                        onClick={() => setActiveTab('data')}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Lihat Semua →
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kelembapan Tanah</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kelembapan Udara</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Suhu Udara</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kecerahan</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Waktu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {sensorData.slice(0, 5).map((item) => (
                            <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                              <td className="px-4 py-3 text-sm font-medium text-gray-800">#{item.id}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{item.kelembapanTanah}%</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{item.kelembapanUdara}%</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{item.suhuUdara}°C</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{item.kecerahan} Lux</td>
                              <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{item.waktu}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <DataTable data={sensorData} />
              )}

              {activeTab === 'api' && (
                <ApiDocs />
              )}

              {activeTab === 'valve' && latestData && (
                <div className="space-y-6">
                  <ValveControl deviceId={1} latestMoisture={latestData.kelembapanTanah} />
                </div>
              )}
              {activeTab === 'database' && (
                <DatabaseSchema />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
            <p>© 2025 Smart Farming IoT - ESP32 Monitoring System</p>
            <p className="flex items-center gap-1 mt-1 sm:mt-0">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              System Operational
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;

