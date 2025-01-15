<?php

$database = './databases/bound_stems_database.db';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve POST data
    $test_id = $_POST['test_id'] ?? '';
    $limit = $_POST['limit'] ?? '';

    if (!$test_id || !$database) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing test_id, or database.']);
        exit;
    }

    // Validate and sanitize the database name
    $database = basename($database); // Prevent directory traversal attacks
    $dbPath = "./databases/{$database}"; // Assuming databases are stored in a 'databases' folder

    if (!file_exists($dbPath)) {
        http_response_code(404);
        echo json_encode(['error' => 'Database not found.']);
        exit;
    }

    try {
        // Connect to the specified SQLite database
        $dbh = new PDO('sqlite:'.$dbPath, null, null, [PDO::ATTR_PERSISTENT => true]);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // SQL query
        $sql = <<<SQL
        SELECT * FROM words 
        WHERE test_id = ? 
        ORDER BY RANDOM()
        LIMIT ?
        SQL;

        // Prepare and execute the query
        $statement = $dbh->prepare($sql);
        $statement->bindParam(1, $test_id);
        $statement->bindParam(2, $limit);
        $statement->execute();

        // Fetch and return results
        $results = $statement->fetchAll(PDO::FETCH_NUM);
        echo json_encode($results);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: '.$e->getMessage()]);
    }
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Invalid request method.']);
}