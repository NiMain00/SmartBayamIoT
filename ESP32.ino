#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// WIFI
const char* ssid = "ilmi";
const char* password = "31102006";

// SERVER
const char* serverUrl =
  "https://smartfarmbayam.my.id/api/sensor.php";

const char* valveStatusUrl =
  "https://smartfarmbayam.my.id/api/sensor.php?valve-status&device_id=1";

// PIN
#define SOIL_MOISTURE_PIN 34
#define DHT_PIN 5
#define LDR_PIN 35
#define PUMP_PIN 18

#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

// GLOBAL
String valveMode = "manual";
String valveStatus = "OFF";
float valveThreshold = 30.0;

bool relayStateChanged = false;
unsigned long lastManualChange = 0;

float lastHum = 0;
float lastTemp = 0;

// ================= SETUP =================
void setup() {

  Serial.begin(115200);

  delay(1000);

  Serial.println("\n🚀 ESP32 Pump Controller");

  dht.begin();

  delay(2000);

  pinMode(PUMP_PIN, OUTPUT);

  digitalWrite(PUMP_PIN, LOW);

  // WIFI
  WiFi.begin(ssid, password);
WiFi.setSleep(false);

  Serial.print("📶 Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi Connected");

  Serial.println(WiFi.localIP());

  updateValveStatus();
}

// ================= UPDATE STATUS =================
void updateValveStatus() {

  if (millis() - lastManualChange < 3000) {
    Serial.println("⏸️ Skip sync");
    return;
  }

  Serial.println("📡 Fetch valve status...");

  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;

  
  http.begin(valveStatusUrl);
http.setTimeout(10000);

  int code = http.GET();

  if (code == 200) {

    String resp = http.getString();

    StaticJsonDocument<300> doc;

    DeserializationError err =
      deserializeJson(doc, resp);

    if (!err && doc["valve"]) {

      JsonObject v = doc["valve"];

      valveMode = v["mode"] | "manual";

      valveStatus = v["status"] | "OFF";

      valveThreshold =
        v["threshold_moisture"] | 60.0;

      Serial.printf(
        "✅ Server: %s | %s | %.1f\n",
        valveMode.c_str(),
        valveStatus.c_str(),
        valveThreshold
      );
    }

  } else {

    Serial.printf(
      "❌ HTTP ERROR: %d\n",
      code
    );
  }

  http.end();
yield();
}

// ================= CONTROL PUMP =================
bool controlPump(float soilMoisture) {

  bool newState;

  if (valveMode == "manual") {

    newState = (valveStatus == "ON");

    Serial.println("🔧 MANUAL mode");

  } else {

    newState =
      (soilMoisture < valveThreshold);

    Serial.printf(
      "🤖 AUTO: %.1f < %.1f = %s\n",
      soilMoisture,
      valveThreshold,
      newState ? "ON" : "OFF"
    );
  }

  int target = newState ? HIGH : LOW;

  int current = digitalRead(PUMP_PIN);

 if (current != target) {

    // kalau mau nyala
    if (target == HIGH) {

        // pastikan benar-benar mati dulu
        digitalWrite(PUMP_PIN, LOW);

        Serial.println("⚡ Stabilizing power");

        delay(1500);
    }

    // nyalakan / matikan
    digitalWrite(PUMP_PIN, target);

    delay(300);

    valveStatus = newState ? "ON" : "OFF";

    relayStateChanged = true;

    lastManualChange = millis();

    Serial.printf(
      "💧 PUMP %s\n",
      newState ? "ON 🔥" : "OFF 🛑"
    );

    return true;
}

  return false;
}

// ================= SEND VALVE =================
void sendValveUpdate() {

  if (!relayStateChanged) return;

  HTTPClient http;

  http.begin(serverUrl);
  http.setTimeout(10000);

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  StaticJsonDocument<200> doc;

  doc["valve_status"] = valveStatus;
  doc["device_id"] = 1;
  doc["mode"] = valveMode;

  String json;

  serializeJson(doc, json);

  int code = http.POST(json);

  Serial.printf("📤 Sync: %d\n", code);

  http.end();
  yield();

  relayStateChanged = false;
}

// ================= SEND SENSOR =================
void sendSensorData(
  float soil,
  float hum,
  float temp,
  float light
) {

  HTTPClient http;

  http.begin(serverUrl);
  http.setTimeout(10000);

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  StaticJsonDocument<300> doc;

  doc["kelembapan_tanah"] = soil;
  doc["kelembapan_udara"] = hum;
  doc["suhu_udara"] = temp;
  doc["kecerahan"] = light;

  String json;

  serializeJson(doc, json);

  Serial.println("📤 JSON:");
  Serial.println(json);

  int code = http.POST(json);

Serial.printf("📊 Sensor: %d\n", code);

if (code > 0) {

    String response = http.getString();

    Serial.println("📥 RESPONSE:");
    Serial.println(response);

} else {

    Serial.println("❌ Failed POST");
}

http.end();

yield();
}

// ================= LOOP =================
void loop() {

  if (WiFi.status() != WL_CONNECTED) {

    WiFi.reconnect();

    delay(5000);

    return;
  }

  updateValveStatus();

  int soilRaw =
    analogRead(SOIL_MOISTURE_PIN);

float soil =
  ((4095.0 - soilRaw) / 4095.0) * 100.0;

soil = constrain(soil, 0, 100);

  float hum = dht.readHumidity();
float temp = dht.readTemperature();

  // jika DHT rusak
  if (isnan(hum) || isnan(temp)) {

    Serial.println("❌ DHT22 ERROR");

    hum = lastHum;
temp = lastTemp;
  }

  float light =
    map(
      analogRead(LDR_PIN),
      4095,
      0,
      0,
      1000
    );

  Serial.printf(
    "🌱 Soil: %.1f%%\n",
    soil
  );

  bool changed =
    controlPump(soil);

  sendSensorData(
    soil,
    hum,
    temp,
    light
  );

  if (changed) {
    sendValveUpdate();
  }

  delay(15000);
}