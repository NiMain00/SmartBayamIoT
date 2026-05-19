#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// 🔧 WI-FI - UPDATE SESUAI JARINGAN ANDA
const char* ssid = "HOGWARTS";
const char* password = "karim1969";

// 🔧 SERVER IP - GANTI DENGAN IP KOMPUTER XAMPP
const char* serverUrl = "http://192.168.100.140/ZIP-kode-aplikasi-web/api/sensor.php";
const char* valveStatusUrl = "http://192.168.100.140/ZIP-kode-aplikasi-web/api/sensor.php?valve-status&device_id=1";

// Pin
#define SOIL_MOISTURE_PIN 34
#define DHT_PIN 4
#define LDR_PIN 35
#define RELAY_PIN 19

#define DHT_TYPE DHT22 
DHT dht(DHT_PIN, DHT_TYPE);

// Globals
String valveMode = "auto";
String valveStatus = "OFF";
float valveThreshold = 30.0; // 🛡️ SAFE DEFAULT 30%
bool relayStateChanged = false;
unsigned long lastDebug = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n🚀 ESP32 Pump Controller Debug Mode");
  
  dht.begin();
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // ❌ OFF paksa
  Serial.println("🔌 Relay PIN 19: HIGH = OFF");

  // WiFi
  WiFi.begin(ssid, password);
  Serial.print("📶 WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi OK: " + WiFi.localIP().toString());
  
  updateValveStatus();
  Serial.println("=== SETUP COMPLETE ===");
}

float readHumidity() { float h = dht.readHumidity(); return isnan(h) ? 0 : h; }
float readTemperature() { float t = dht.readTemperature(); return isnan(t) ? 0 : t; }

void debugLog(const char* msg) {
  Serial.println("DEBUG: " + String(msg));
}

void updateValveStatus() {
  Serial.println("📡 Polling valve status...");
  
  if (WiFi.status() != WL_CONNECTED) {
    debugLog("WiFi down - keep defaults");
    return;
  }
  
  HTTPClient http;
  http.begin(valveStatusUrl);
  int httpCode = http.GET();
  
  Serial.printf("HTTP %d: ", httpCode);
  
  if (httpCode == 200) {
    String resp = http.getString();
    Serial.println(resp.substring(0, 100) + "...");
    
    StaticJsonDocument<300> doc;
    DeserializationError err = deserializeJson(doc, resp);
    
    if (!err && doc["valve"]) {
      JsonObject v = doc["valve"];
      String oldMode = valveMode;
      valveMode = v["mode"] | "manual";
      valveStatus = v["status"] | "OFF";
      valveThreshold = v["threshold_moisture"] | 30.0;
      
      Serial.printf("✅ UPDATE: %s → %s | %s | %.1f%%\n", 
        oldMode.c_str(), valveMode.c_str(), valveStatus.c_str(), valveThreshold);
    } else {
      Serial.println("❌ JSON parse fail");
    }
  } else {
    Serial.printf("❌ API ERROR %d\n", httpCode);
  }
  http.end();
  
  // 🛡️ LOG DECISION STATE
  Serial.printf("🎯 CONTROL STATE: mode=%s status=%s thresh=%.1f\n", 
    valveMode.c_str(), valveStatus.c_str(), valveThreshold);
}

bool controlPump(float soilMoisture, int soilRaw) {
  bool newState;
  
  Serial.printf("🌱 Soil raw=%d mapped=%.1f%%\n", soilRaw, soilMoisture);
  
  if (valveMode == "manual") {
    newState = (valveStatus == "ON");
    Serial.println("🔧 MANUAL mode");
  } else {
    newState = (soilMoisture < valveThreshold);
    Serial.printf("🤖 AUTO: soil %.1f < %.1f = %s\n", soilMoisture, valveThreshold, newState?"ON":"OFF");
  }
  
  int targetPin = newState ? LOW : HIGH;  // LOW=ON relay
  int currentPin = digitalRead(RELAY_PIN);
  
  Serial.printf("⚡ Relay: current=%d target=%d (%s)\n", currentPin, targetPin, newState?"ON":"OFF");
  
  if (currentPin != targetPin) {
    digitalWrite(RELAY_PIN, targetPin);
    relayStateChanged = true;
    Serial.printf("💧 PUMP %s! (pin=%d)\n", newState ? "ON 🔥" : "OFF 🛑", targetPin);
    return true;
  }
  
  Serial.println("⏸️ Pump state OK");
  return false;
}

void sendValveUpdate() {
  if (!relayStateChanged) return;
  
  Serial.println("📤 Sync valve state...");
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<200> doc;
  doc["valve_status"] = valveStatus;
  doc["device_id"] = 1;
  doc["mode"] = valveMode;
  doc["reason"] = "esp32_auto";
  
  String json;
  serializeJson(doc, json);
  
  int code = http.POST(json);
  Serial.printf("HTTP POST valve: %d\n", code);
  http.end();
  
  relayStateChanged = false;
}

void sendSensorData(float soilMoisture, float hum, float temp, float light) {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<300> doc;
  doc["kelembapan_tanah"] = soilMoisture;
  doc["kelembapan_udara"] = hum;
  doc["suhu_udara"] = temp;
  doc["kecerahan"] = light;
  
  String json;
  serializeJson(doc, json);
  
  int code = http.POST(json);
  Serial.printf("📊 Sensor POST: %d\n", code);
  http.end();
}

void loop() {
  if (!WiFi.status() == WL_CONNECTED) {
    Serial.println("❌ WiFi down - reconnect");
    WiFi.reconnect();
    delay(5000);
    return;
  }
  
  // === CYCLE ===
  updateValveStatus();
  
  // Sensors
  int soilRaw = analogRead(SOIL_MOISTURE_PIN);
  float soil = map(soilRaw, 4095, 0, 0, 100);
  float hum = readHumidity();
  float temp = readTemperature();
  float light = map(analogRead(LDR_PIN), 4095, 0, 0, 1000);
  
  Serial.printf("=== CYCLE SoilRaw=%d Soil%%=%.1f ===\n", soilRaw, soil);
  
  // Pump control
  bool changed = controlPump(soil, soilRaw);
  
  // Send data
  sendSensorData(soil, hum, temp, light);
  
  if (changed) sendValveUpdate();
  
  Serial.println("⏳ 10s wait...\n");
  delay(10000);
}
