<?php
function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;

    $cfg = require __DIR__ . '/config.php';
    $dsn = "mysql:host={$cfg['db_host']};dbname={$cfg['db_name']};charset=utf8mb4";

    $pdo = new PDO($dsn, $cfg['db_user'], $cfg['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => true, // OK for shared hosting (fixes LIMIT/OFFSET binds)
    ]);

    return $pdo;
}
