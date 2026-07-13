# Gmail SMTP Configuration Guide

This guide will help you set up and configure the contact form on your website so it can send emails directly to your Gmail account.

The website contact form is powered by a secure PHP script (`send_email.php`) that connects to Gmail using SMTP.

---

## Step 1: Generate a Gmail App Password
Google (Gmail) requires a special **App Password** for security. Your standard Gmail login password will not work.

1. Go to your **[Google Account](https://myaccount.google.com/)** settings page.
2. Select **Security** from the left menu.
3. Under the section **"How you sign in to Google"**, ensure that **2-Step Verification** is turned **ON**.
4. Click on **2-Step Verification**, scroll down to the bottom, and click on **App passwords**.
5. Choose a name for the app (e.g., `Website Contact Form`) and click **Create**.
6. Google will display a **16-character password** (e.g., `abcd efgh ijkl mnop`). **Copy this password!** You will need to put this in your config.

---

## Step 2: Configure Your Credentials in the Code

Open the `send_email.php` file in a text editor (like Notepad, VS Code, or your cPanel File Manager) and locate the configuration section at the top:

```php
// =========================================================================
// 1. SMTP & GMAIL CREDENTIALS CONFIGURATION
// =========================================================================
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);                     // Keep as 587 (TLS)
define('SMTP_ENCRYPTION', 'tls');             // Keep as 'tls'

define('SMTP_USERNAME', 'YOUR_GMAIL_HERE@gmail.com');          // <-- Change to your Gmail address
define('SMTP_PASSWORD', 'YOUR_GMAIL_APP_PASSWORD_HERE');      // <-- Change to your 16-character App Password (remove spaces)
define('SMTP_FROM_NAME', 'Website Contact Form');              // <-- Change to your business name

define('SMTP_TO_EMAIL', 'YOUR_RECEIVING_EMAIL_HERE@gmail.com'); // <-- Change to where you want to receive emails
// =========================================================================
```

### Save changes after updating the fields.

---

## Step 3: Installing Dependencies (PHPMailer)

Before the script can send emails, the PHPMailer package must be present. You have two options to install it:

### Option A: Install manually (Easiest for Shared Hosting/cPanel)
1. Download PHPMailer from GitHub: [Download PHPMailer ZIP](https://github.com/PHPMailer/PHPMailer/archive/refs/heads/master.zip)
2. Extract the ZIP file.
3. Copy the folder named `src` inside the extracted folder.
4. Paste it in your website root folder next to `send_email.php` and rename the folder to `PHPMailer`.
5. The folder structure should look like this:
   ```text
   /index.html
   /send_email.php
   /PHPMailer/
       Exception.php
       PHPMailer.php
       SMTP.php
   ```

### Option B: Install via Composer (For VPS/Modern Server environments)
If your host supports terminal commands, run:
```bash
composer require phpmailer/phpmailer
```

---

## Step 4: Upload and Test!
1. Upload all your files (including `send_email.php` and the `PHPMailer` folder) to your hosting server.
2. Visit your website contact form in your browser.
3. Fill out the form and submit.
4. Check your receiving email inbox (and Spam folder, if it is the first test) for the form submission details!
