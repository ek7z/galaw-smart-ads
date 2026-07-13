<?php
/**
 * PHP PHPMailer SMTP Email Sender (Gmail Configured)
 * 
 * Instructions:
 * 1. Fill in your Gmail Credentials in the settings below.
 * 2. If using Composer, run `composer require phpmailer/phpmailer`.
 *    If not using Composer, download PHPMailer manually and extract the 'src' files into a folder named 'PHPMailer' in the same directory.
 * 3. Make sure to generate a 16-character "App Password" in your Google Account Security settings.
 */

// Enable CORS for development/cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight options requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// =========================================================================
// 1. SMTP & GMAIL CREDENTIALS CONFIGURATION
// =========================================================================
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);                     // 587 for TLS, 465 for SSL
define('SMTP_ENCRYPTION', 'tls');             // 'tls' or 'ssl'

define('SMTP_USERNAME', 'YOUR_GMAIL_HERE@gmail.com');          // Enter your Sender Gmail Address here
define('SMTP_PASSWORD', 'YOUR_GMAIL_APP_PASSWORD_HERE');      // Enter your 16-character Gmail App Password here
define('SMTP_FROM_NAME', 'Galaw Lead Booking');                // Sender Display Name

define('SMTP_TO_EMAIL', 'YOUR_RECEIVING_EMAIL_HERE@gmail.com'); // Where notifications will be sent (can be same or different)
// =========================================================================

// Load PHPMailer (Autoload if using Composer, or fall back to manual path)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
} else {
    // Manual setup fallback: place the PHPMailer src folder content inside a folder named 'PHPMailer'
    if (file_exists(__DIR__ . '/PHPMailer/Exception.php')) {
        require __DIR__ . '/PHPMailer/Exception.php';
        require __DIR__ . '/PHPMailer/PHPMailer.php';
        require __DIR__ . '/PHPMailer/SMTP.php';
    } else if (file_exists(__DIR__ . '/PHPMailer/src/Exception.php')) {
        require __DIR__ . '/PHPMailer/src/Exception.php';
        require __DIR__ . '/PHPMailer/src/PHPMailer.php';
        require __DIR__ . '/PHPMailer/src/SMTP.php';
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'PHPMailer files not found. Please install PHPMailer via Composer or place PHPMailer files in the folder.'
        ]);
        exit;
    }
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Get POST data (accepts JSON or application/x-www-form-urlencoded)
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

// Sanitize inputs
$name      = isset($input['name']) ? strip_tags(trim($input['name'])) : '';
$business  = isset($input['business']) ? strip_tags(trim($input['business'])) : '';
$email     = isset($input['email']) ? filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL) : '';
$phone     = isset($input['phone']) ? strip_tags(trim($input['phone'])) : '';
$revenue   = isset($input['revenue']) ? strip_tags(trim($input['revenue'])) : '';
$challenge = isset($input['challenge']) ? strip_tags(trim($input['challenge'])) : '';

// Validate required fields
if (empty($name) || empty($business) || empty($email) || empty($phone) || empty($revenue)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Please fill out all required fields.'
    ]);
    exit;
}

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USERNAME;
    $mail->Password   = SMTP_PASSWORD;
    $mail->SMTPSecure = SMTP_ENCRYPTION === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    // Recipients
    $mail->setFrom(SMTP_USERNAME, SMTP_FROM_NAME);
    $mail->addAddress(SMTP_TO_EMAIL);             // Send copy to site owner
    $mail->addReplyTo($email, $name);             // Allow replying directly to the user who filled the form

    // Email Layout / Styling
    $mail->isHTML(true);
    $mail->Subject = 'New Strategy Call Booking: ' . $business;
    
    $mail->Body = "
    <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
        <div style='background-color: #ff5a1f; color: white; padding: 20px; text-align: center;'>
            <h1 style='margin: 0; font-size: 24px; font-weight: bold;'>New Strategy Call Booking</h1>
            <p style='margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;'>Galaw Smart Advertising Lead Capture</p>
        </div>
        <div style='padding: 25px; background-color: #ffffff;'>
            <p style='margin-top: 0;'>A new strategy call has been booked. Here are the details:</p>
            <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                <tr style='border-bottom: 1px solid #eee;'>
                    <td style='padding: 10px 0; font-weight: bold; width: 35%; color: #666;'>Full Name:</td>
                    <td style='padding: 10px 0;'><strong>" . htmlspecialchars($name) . "</strong></td>
                </tr>
                <tr style='border-bottom: 1px solid #eee;'>
                    <td style='padding: 10px 0; font-weight: bold; color: #666;'>Business Name:</td>
                    <td style='padding: 10px 0;'>" . htmlspecialchars($business) . "</td>
                </tr>
                <tr style='border-bottom: 1px solid #eee;'>
                    <td style='padding: 10px 0; font-weight: bold; color: #666;'>Email Address:</td>
                    <td style='padding: 10px 0;'><a href='mailto:" . htmlspecialchars($email) . "' style='color: #ff5a1f; text-decoration: none;'>" . htmlspecialchars($email) . "</a></td>
                </tr>
                <tr style='border-bottom: 1px solid #eee;'>
                    <td style='padding: 10px 0; font-weight: bold; color: #666;'>Phone Number:</td>
                    <td style='padding: 10px 0;'>" . htmlspecialchars($phone) . "</td>
                </tr>
                <tr style='border-bottom: 1px solid #eee;'>
                    <td style='padding: 10px 0; font-weight: bold; color: #666;'>Monthly Revenue:</td>
                    <td style='padding: 10px 0; text-transform: capitalize;'>" . htmlspecialchars($revenue) . "</td>
                </tr>
            </table>
            
            <div style='background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff5a1f; border-radius: 4px; margin-top: 15px;'>
                <h3 style='margin: 0 0 10px 0; font-size: 14px; color: #333;'>Biggest Challenge Right Now:</h3>
                <p style='margin: 0; font-style: italic; color: #555; white-space: pre-wrap;'>" . htmlspecialchars($challenge) . "</p>
            </div>
        </div>
        <div style='background-color: #f5f5f5; color: #888; text-align: center; padding: 15px; font-size: 11px; border-top: 1px solid #eee;'>
            This automated email was sent from your website's contact form.
        </div>
    </div>
    ";

    $mail->AltBody = "New Strategy Call Booking Details\n\n" .
                     "Full Name: {$name}\n" .
                     "Business Name: {$business}\n" .
                     "Email Address: {$email}\n" .
                     "Phone Number: {$phone}\n" .
                     "Monthly Revenue: {$revenue}\n" .
                     "Biggest Challenge: {$challenge}\n";

    $mail->send();
    echo json_encode([
        'status' => 'success',
        'message' => 'Your booking request has been sent successfully!'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"
    ]);
}
