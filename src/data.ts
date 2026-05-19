import { SensorData } from './types';

function generateRandomValue(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function generateTimestamp(hoursAgo: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

export const generateMockData = (count: number): SensorData[] => {
  const data: SensorData[] = [];
  for (let i = count; i >= 1; i--) {
    data.push({
      id: i,
      kelembapanTanah: generateRandomValue(30, 85),
      kelembapanUdara: generateRandomValue(50, 95),
      suhuUdara: generateRandomValue(24, 35),
      kecerahan: generateRandomValue(200, 1000),
      latitude: -6.2 + (Math.random() * 0.01 - 0.005),
      longitude: 106.8 + (Math.random() * 0.01 - 0.005),
      waktu: generateTimestamp(i),
    });
  }
  return data;
};

export const latestSensorData: SensorData = {
  id: 1,
  kelembapanTanah: 65.3,
  kelembapanUdara: 78.2,
  suhuUdara: 28.5,
  kecerahan: 720,
  latitude: -6.2088,
  longitude: 106.8456,
  waktu: new Date().toISOString().replace('T', ' ').substring(0, 19),
};
