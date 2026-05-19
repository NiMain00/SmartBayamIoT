export interface ValveStatus {
  deviceId: number;
  status: 'ON' | 'OFF';
  mode: 'auto' | 'manual';
  thresholdMoisture: number;

}

export interface SensorData {
  id: number;
  kelembapanTanah: number;
  kelembapanUdara: number;
  suhuUdara: number;
  kecerahan: number;
  latitude: number;
  longitude: number;
  waktu: string;
  valve_status?: 'ON' | 'OFF';
  valve_mode?: 'auto' | 'manual';
  threshold_moisture?: number;

}

export interface SensorStatus {
  label: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
  min: number;
  max: number;
  status: 'normal' | 'warning' | 'danger';
}

export type TabType = 'dashboard' | 'data' | 'api' | 'database';
