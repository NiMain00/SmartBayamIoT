import React, { useState, useEffect } from 'react';
import { ValveStatus } from '../types';
import { fetchValveStatus, toggleValve, setValveAutoThreshold } from '../api';
import { Settings, Zap, Droplets, RotateCcw } from 'lucide-react';

interface ValveControlProps {
  deviceId?: number;
  latestMoisture?: number;
}

const ValveControl: React.FC<ValveControlProps> = ({ deviceId = 1, latestMoisture = 0 }) => {
    const [isEditingThreshold, setIsEditingThreshold] = useState(false);
const [valve, setValve] = useState<ValveStatus>({ deviceId, status: 'OFF' as 'ON' | 'OFF', mode: 'manual' as 'auto' | 'manual', thresholdMoisture: 30 });
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(30);

  useEffect(() => {
    loadValveStatus();
    const interval = setInterval(loadValveStatus, 3000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const loadValveStatus = async () => {
  try {
    const status = await fetchValveStatus(deviceId!);
    setValve(status);

    // 🔥 jangan override kalau user lagi geser
    if (!isEditingThreshold) {
      setThreshold(status.thresholdMoisture || 30);
    }
  } catch (e) {
    console.error('Valve status error', e);
  }
};

  const handleToggleManual = async (status: 'ON' | 'OFF') => {
    setLoading(true);
    try {
        await toggleValve(deviceId!, status, 'manual');
        await loadValveStatus();
    } catch (e) {
      alert('Error toggling valve');
    }
    setLoading(false);
  };

  const handleModeChange = async (enabled: boolean) => {
    const newMode: 'auto' | 'manual' = enabled ? 'auto' : 'manual';
    setLoading(true);
    try {
      if (newMode === 'auto') {
      await toggleValve(deviceId!, valve.status, 'auto');
    } else {
      await toggleValve(deviceId!, valve.status, 'manual');
    }

      // Sync real state
      await loadValveStatus();
    } catch (e) {
      console.error('Mode change error:', e);
      alert('Error changing mode - check console');
    }
    setLoading(false);
  };

  const handleThresholdChange = (value: number) => {
  setThreshold(value);
};

const handleThresholdCommit = async () => {
  if (valve.mode === 'auto') {
    try {
      await setValveAutoThreshold(deviceId!, threshold);
      await loadValveStatus();
    } catch (e) {
      console.error('Threshold update error:', e);
    }
  }
};


  const isAutoRecommended = latestMoisture < threshold;

  const CustomSwitch = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
    <button
      className={`relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 peer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
        checked ? 'bg-blue-600' : ''
      }`}
      onClick={() => onChange(!checked)}
    >
      <span className={`pointer-events-none absolute inset-0 mx-0.5 rounded-full transition-colors ${
        checked ? 'bg-white translate-x-5' : 'bg-transparent'
      }`} />
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center">
          <Droplets className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Kontrol Katup Irigasi</h3>
          <p className="text-sm text-gray-500">Device #{deviceId} - Otomatis / Manual</p>
        </div>
      </div>

      {/* Status Card */}
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Status Katup</span>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            valve.status === 'ON' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {valve.status === 'ON' ? 'TERBUKA' : 'TERTUTUP'}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span>Mode: <span className={`font-medium ${valve.mode === 'auto' ? 'text-blue-600' : 'text-gray-600'}`}>{valve.mode.toUpperCase()}</span></span>
          {isAutoRecommended && valve.mode !== 'auto' && (
            <div className="ml-auto flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs">
              <Zap className="w-3 h-3" />
              Disarankan AUTO
            </div>
          )}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Mode Otomatis</span>
          <button
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              valve.mode === 'auto' ? 'bg-blue-600' : 'bg-gray-200'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !loading && handleModeChange(valve.mode !== 'auto')}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              valve.mode === 'auto' ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </label>
      </div>

      {/* Manual Buttons */}
{valve.mode === 'auto' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <Zap className="w-4 h-4" />
            <span>⚠️ Mode AUTO aktif - Menggunakan tombol manual akan beralih ke mode MANUAL</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => handleToggleManual('ON')}
          disabled={loading || valve.status === 'ON'}
          className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-emerald-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
        >
          <Droplets className="w-4 h-4" />
          Buka
        </button>
        <button
          onClick={() => handleToggleManual('OFF')}
          disabled={loading || valve.status === 'OFF'}
          className="flex items-center justify-center gap-2 bg-gray-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
        >
          Tutup Katup
        </button>
      </div>

      {/* Auto Threshold */}
      {valve.mode === 'auto' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Threshold (%)</span>
            <span className="text-sm font-bold">{threshold}%</span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full mb-3">
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" 
              style={{ width: `${Math.min(100, (threshold / 60) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>10%</span>
            <span>60%</span>
          </div>
          <input
  type="range"
  min="10"
  max="60"
  step="1"
  value={threshold}
  onMouseDown={() => setIsEditingThreshold(true)}
  onMouseUp={() => setIsEditingThreshold(false)}
  onChange={(e) => handleThresholdChange(Number(e.target.value))}
  disabled={loading}
  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
/>

          <p className="text-xs text-gray-500 mt-2 text-center">
            Buka jika &lt; {threshold}% (Sekarang: {latestMoisture.toFixed(1)}%)
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={loadValveStatus}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-emerald-200 text-emerald-700 bg-emerald-50 rounded-xl font-medium hover:bg-emerald-100 transition-colors text-sm disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh
        </button>
        <button
          onClick={() => window.open('http://10.177.28.44/ZIP-kode-aplikasi-web/api/sensor.php', '_blank')}
          className="flex items-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-xl transition-colors"
        >
          <Settings className="w-4 h-4" />
          Test API
        </button>
      </div>
    </div>
  );
};

export default ValveControl;

