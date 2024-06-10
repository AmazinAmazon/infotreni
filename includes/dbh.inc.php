<?php 
//ini_set('display_errors', 0);

$dsn = "mysql:host=localhost;dbname=train_reports";
$username = "root";
$password = "---";


try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    $pdo = false;
    //printf("Failed to connect: " . $e->getMessage());
}
?>