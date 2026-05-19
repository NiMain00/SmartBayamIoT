<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "localhost";
$username = "bayamiot";
$password = "kicaumania";
$database = "iot3";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Koneksi gagal"]));
}

// Handle GET params for limit/recent
$limit = isset($_GET['limit']) ? $_GET['limit'] : 100;
$recent = isset($_GET['recent']) && $_GET['recent'] === 'true';
$order = $recent ? 'id DESC' : 'id ASC';

// POST - Terima data dari ESP32 or valve control
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    // Valve control
    if (isset($data['valve_status'])) {
        $device_id = (int)($data['device_id'] ?? 1);
        $status = strtoupper((string)($data['valve_status'] ?? 'OFF'));
        $mode = (string)($data['mode'] ?? 'manual');
        $threshold = $data['threshold_moisture'] ?? null;

        $reason = (string)($data['reason'] ?? 'user');
        $triggered_by = (string)($data['triggered_by'] ?? 'manual');

        try {
            if ($threshold !== null) {
                // Skipping update threshold here because original code comments indicate the table may differ.
            }

            $stmt = $conn->prepare(
                "INSERT INTO valve_status (device_id, status, mode) VALUES (?, ?, ?) " .
                "ON DUPLICATE KEY UPDATE status = ?, mode = ?, last_updated = CURRENT_TIMESTAMP"
            );
            if (!$stmt) {
                throw new Exception("Prepare valve_status failed: " . $conn->error);
            }
            $stmt->bind_param("issss", $device_id, $status, $mode, $status, $mode);
            if (!$stmt->execute()) {
                throw new Exception("Execute valve_status failed: " . $stmt->error);
            }
            $stmt->close();

            $stmt = $conn->prepare(
                "INSERT INTO valve_logs (device_id, status, mode, triggered_by, reason) " .
                "VALUES (?, ?, ?, ?, ?)"
            );
            if (!$stmt) {
                throw new Exception("Prepare valve_logs failed: " . $conn->error);
            }
            $stmt->bind_param("issss", $device_id, $status, $mode, $triggered_by, $reason);
            if (!$stmt->execute()) {
                throw new Exception("Execute valve_logs failed: " . $stmt->error);
            }
            $stmt->close();

            echo json_encode([
                "status" => "success",
                "message" => "Valve $status",
                "data" => ["device_id" => $device_id]
            ]);
            exit();
        } catch (Exception $e) {

            http_response_code(500);
            // tampilkan juga request body supaya gampang debug
            echo json_encode([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
            exit();
        }

    }


    
    // Sensor data
    $stmt = $conn->prepare(
        "INSERT INTO sensor_data 
        (kelembapan_tanah, kelembapan_udara, suhu_udara, kecerahan, waktu) 
        VALUES (?, ?, ?, ?, NOW())"
    );
    
    $stmt->bind_param("dddd",
        $data['kelembapan_tanah'],
        $data['kelembapan_udara'],
        $data['suhu_udara'],
        $data['kecerahan']
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
} else {
    // Valve status GET ?valve-status&device_id=1
    if (isset($_GET['valve-status'])) {
        $device_id = $_GET['device_id'] ?? 1;
        $stmt = $conn->prepare("SELECT * FROM valve_status WHERE device_id = ?");
        $stmt->bind_param("i", $device_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $status = $result->fetch_assoc();
        echo json_encode(["status" => "success", "valve" => $status ?: []]);
        $stmt->close();
        exit();
    }
    
    // Sensor data with valve info (latest for each device)
$sql = "
        SELECT sd.*, 'OFF' as valve_status, 'manual' as valve_mode, 30 as threshold_moisture,
               COALESCE((SELECT AVG(kelembapan_tanah) FROM sensor_data s2 WHERE s2.id >= GREATEST(sd.id - 10, 0)), 0) as avg_moisture
        FROM sensor_data sd 
        ORDER BY sd.id DESC LIMIT $limit
    ";

    try {
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception("Query failed: " . $conn->error);
        }
        
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        echo json_encode(["status" => "success", "data" => $data]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }

}

$conn->close();
?>

