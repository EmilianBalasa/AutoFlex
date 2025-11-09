<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-control-allow-headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    parse_str(file_get_contents('php://input'), $input);
}

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$phone = trim($input['phone'] ?? '');
$subject = trim($input['subject'] ?? '');
$message = trim($input['message'] ?? '');

$errors = [];

if (empty($name)) {
    $errors[] = 'Name is required';
}

if (empty($email)) {
    $errors[] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email format';
}

if (empty($subject)) {
    $errors[] = 'Subject is required';
}

if (empty($message)) {
    $errors[] = 'Message is required';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

$to = 'support@autoflex.com';
$email_subject = 'New Contact Form Message: ' . $subject;

$email_body = "
New message from Autoflex contact form:

Name: $name
Email: $email
Phone: $phone
Subject: $subject

Message:
$message

---
Sent from Autoflex contact form
";

$headers = [
    'From: ' . $email,
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8'
];

$mail_sent = mail($to, $email_subject, $email_body, implode("\r\n", $headers));

if ($mail_sent) {
    $log_entry = date('Y-m-d H:i:s') . " - Contact from: $name ($email) - Subject: $subject\n";
    file_put_contents('contact_log.txt', $log_entry, FILE_APPEND | LOCK_EX);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Thank you! Your message has been sent successfully. We will get back to you soon.'
    ]);
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'Sorry, there was an error sending your message. Please try again later.'
    ]);
}
?>
