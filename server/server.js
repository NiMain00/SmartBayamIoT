import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'iot_smart_farming',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/api/sensor-data', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const recent = req.query.recent === 'true';
    const orderBy = recent ? 'ORDER BY waktu DESC' : 'ORDER BY id ASC';
    const [rows] = await pool.execute(
      `SELECT * FROM sensor_data ${orderBy} LIMIT ?`,
      [limit]
    );
    res.json(rows);
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/api/devices', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM devices WHERE is_active = 1');
    res.json(rows);
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

app.get('/api/thresholds', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM sensor_thresholds');
    res.json(rows);
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Failed to fetch thresholds' });
  }
});

app.post('/api/valve-control', async (req, res) => {
  try {
    const { device_id, valve_status, triggered_by = 'manual' } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO valve_control (device_id, valve_status, triggered_by) VALUES (?, ?, ?)',
      [device_id, valve_status, triggered_by]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Failed to update valve' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 IoT API Server running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET /api/sensor-data?limit=50&recent=true');
  console.log('  GET /api/devices');
  console.log('  POST /api/valve-control');
});

export default app;

