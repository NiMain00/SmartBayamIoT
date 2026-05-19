import { useState } from 'react';
import { Copy, Check, Server, Code, Database } from 'lucide-react';

const ApiDocs = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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
      {/* API Endpoint */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-500" />
            API Endpoint - ESP32 ke Server
          </h3>
          <p className="text-sm text-gray-500 mt-1">Endpoint untuk menerima data dari ESP32</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="text-sm font-semibold text-emerald-800 mb-2">POST /api/sensor</div>
            <div className="text-sm text-emerald-700">Endpoint untuk mengirim data sensor dari ESP32</div>
          </div>

          <h4 className="font-semibold text-gray-700 mt-4">📤 Request Body (JSON):</h4>
          <CodeBlock
            index={0}
            code={`{
  "kelembapan_tanah": 65.3,
  "kelembapan_udara": 78.2,
  "suhu_udara": 28.5,
  "kecerahan": 720,
  "latitude": -6.2088,
  "longitude": 106.8456
}`}
          />

          <h4 className="font-semibold text-gray-700 mt-4">📥 Response (JSON):</h4>
          <CodeBlock
            index={1}
            code={`{
  "status": "success",
  "message": "Data berhasil disimpan",
  "data": {
    "id": 1,
    "waktu": "2025-01-15 10:30:00"
  }
}`}
          />
        </div>
      </div>

      {/* ESP32 Arduino Code */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-500" />
            Kode Arduino ESP32
          </h3>
          <p className="text-sm text-gray-500 mt-1">Contoh kode untuk mengirim data sensor ke server</p>
        </div>
        <div className="p-6">
          <CodeBlock
            index={2}
            code={`#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Konfigurasi WiFi
const char* ssid = "Nama_WiFi_Anda";
const char* password = "Password_WiFi_Anda";

// URL Server
const char* serverUrl = "http://your-server.com/api/sensor";

// Pin Sensor
#define SOIL_MOISTURE_PIN 34
#define DHT_PIN 4
#define LDR_PIN 35

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected!");
}

void sendSensorData() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Baca sensor
    int soilMoisture = analogRead(SOIL_MOISTURE_PIN);
    float humidity = readHumidity();    // fungsi baca DHT
    float temperature = readTemperature(); // fungsi baca DHT
    int brightness = analogRead(LDR_PIN);
    
    // Buat JSON
    StaticJsonDocument<256> doc;
    doc["kelembapan_tanah"] = map(soilMoisture, 0, 4095, 0, 100);
    doc["kelembapan_udara"] = humidity;
    doc["suhu_udara"] = temperature;
    doc["kecerahan"] = map(brightness, 0, 4095, 0, 1000);
    
    String jsonData;
    serializeJson(doc, jsonData);
    
    int httpResponseCode = http.POST(jsonData);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    }
    
    http.end();
  }
}

void loop() {
  sendSensorData();
  delay(60000); // Kirim setiap 60 detik
}`}
          />
        </div>
      </div>

      {/* PHP Backend */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-500" />
            Backend PHP (XAMPP)
          </h3>
          <p className="text-sm text-gray-500 mt-1">Kode PHP untuk menerima data dan menyimpan ke database MySQL</p>
        </div>
        <div className="p-6 space-y-4">
          <h4 className="font-semibold text-gray-700">📁 api/sensor.php</h4>
          <CodeBlock
            index={3}
            code={`<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "localhost";
$username = "root";
$password = "";
$database = "iot_smart_farming";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Koneksi gagal"]));
}

// POST - Terima data dari ESP32
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $stmt = $conn->prepare(
        "INSERT INTO sensor_data 
        (kelembapan_tanah, kelembapan_udara, suhu_udara, kecerahan, latitude, longitude) 
        VALUES (?, ?, ?, ?, ?, ?)"
    );
    
    $stmt->bind_param("dddddd",
        $data['kelembapan_tanah'],
        $data['kelembapan_udara'],
        $data['suhu_udara'],
        $data['kecerahan'],
        $data['latitude'],
        $data['longitude']
    );
    
    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Data berhasil disimpan",
            "data" => ["id" => $conn->insert_id]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    $stmt->close();
}

// GET - Ambil semua data
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query(
        "SELECT * FROM sensor_data ORDER BY id DESC LIMIT 100"
    );
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    echo json_encode(["status" => "success", "data" => $data]);
}

$conn->close();
?>`}
          />
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
