import { SensorData, ValveStatus } from './types';

const BASE_URL = `${window.location.origin}/api`;

export const fetchSensorData = async (limit = 50, recent = true): Promise<SensorData[]> => {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (recent) params.append('recent', 'true');
  const url = `${BASE_URL}/sensor.php?${params}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch sensor data');
  const result = await response.json();
  return (result.data || []).map((item: any) => ({
    ...item,
    kelembapanTanah: Number(item.kelembapan_tanah || 0),
    kelembapanUdara: Number(item.kelembapan_udara || 0),
    suhuUdara: Number(item.suhu_udara || 0),
    kecerahan: Number(item.kecerahan || 0),
    latitude: Number(item.latitude || 0),
    longitude: Number(item.longitude || 0),
    valve_status: item.valve_status || 'OFF',
    valve_mode: item.valve_mode || 'manual',
    threshold_moisture: Number(item.threshold_moisture || 30),
    avg_moisture: Number(item.avg_moisture || 0),
    id: Number(item.id || 0),
    waktu: item.waktu || ''
  })) as SensorData[];
};


export const fetchDevices = async () => {
  const response = await fetch(`${BASE_URL}/devices`);
  if (!response.ok) throw new Error('Failed to fetch devices');
  return response.json();
};

export const fetchThresholds = async () => {
  const response = await fetch(`${BASE_URL}/thresholds`);
  if (!response.ok) throw new Error('Failed to fetch thresholds');
  return response.json();
};

export const fetchValveStatus = async (deviceId = 1): Promise<ValveStatus> => {
  const url = `${BASE_URL}/sensor.php?valve-status&device_id=${deviceId}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch valve status');
  const result = await response.json();
  return {
    deviceId,
    status: (result.valve?.status as 'ON' | 'OFF') || 'OFF',
    mode: (result.valve?.mode as 'auto' | 'manual') || 'manual',
    thresholdMoisture: Number(result.valve?.threshold_moisture || 30)
  };
};

export const setValveThresholds = async (deviceId: number, low: number, high: number) => {
  const body: any = { device_id: deviceId, valve_status: 'OFF', mode: 'auto', threshold_moisture: low, reason: 'threshold_change' };
  const url = `${BASE_URL}/sensor.php`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error('Failed to set thresholds');
  return response.json();
};

export const toggleValve = async (deviceId: number, status: 'ON' | 'OFF', mode: 'auto' | 'manual' = 'manual', low?: number, high?: number, reason = 'user') => {
  const body: any = { device_id: deviceId, valve_status: status, mode, reason };
  if (low !== undefined) body.threshold_moisture = low;
  const url = `${BASE_URL}/sensor.php`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error('Failed to toggle valve');
  return response.json();
};

export const setValveAutoThreshold = async (deviceId: number, threshold: number) => {
  const body: any = { device_id: deviceId, valve_status: 'OFF', mode: 'auto', threshold_moisture: threshold, reason: 'threshold_change' };
  const url = `${BASE_URL}/sensor.php`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error('Failed to set auto threshold');
  return response.json();
};

