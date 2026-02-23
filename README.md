# garage-services

This repository contains:
- A Node.js Express backend (`server.js`)
- A Java Swing desktop app (`src/com/garage/GarageServiceApp.java`)

## Local setup
1. Copy `.env.example` to `.env`.
2. Fill in SMTP and MySQL values.
3. Install Node dependencies:

```powershell
npm.cmd install
```

## Run Node backend (deterministic localhost)
Use the launcher scripts on Windows to guarantee one URL:

```powershell
.\run-project.cmd
```

- Canonical URL: `http://localhost:5000`
- No port fallback is used.
- If port `5000` is busy, startup fails and shows the PID/action to fix it.

Stop backend:

```powershell
.\stop-project.cmd
```

Optional direct start:

```powershell
npm.cmd start
```

## Node API + SMTP
Example booking request:

```http
POST http://localhost:5000/api/bookings
Content-Type: application/json

{
  "customerName": "Alex Doe",
  "customerEmail": "alex@example.com",
  "serviceType": "Oil Change",
  "appointmentDate": "2026-03-01T10:00:00Z",
  "notes": "Please check tire pressure"
}
```

Responses:
- `201` booking saved and confirmation email sent
- `502` booking saved but email failed (includes SMTP error code/details)

Legacy alias supported for existing clients:

```http
POST http://localhost:5000/book
```

## Run Java desktop app
`GarageServiceApp` is a desktop Swing app. It does not host a browser server on `localhost`.

Required Java config:
- `JAVA_DB_URL`
- `JAVA_DB_USER`
- `JAVA_DB_PASSWORD`
- `JAVA_SMTP_USER`
- `JAVA_SMTP_PASS`
- `JAVA_SMTP_FROM`

Optional Java SMTP config:
- `JAVA_SMTP_HOST` (default `smtp-relay.brevo.com`)
- `JAVA_SMTP_PORT` (default `587`)

Node backend SMTP config can also fall back to `JAVA_SMTP_*` when `SMTP_*` is not set.

Initialize DB tables:

```powershell
mysql -u root -p < sql/setup.sql
```

Compile and run:

```powershell
$mail = "$env:USERPROFILE\.m2\repository\com\sun\mail\jakarta.mail\2.0.1\jakarta.mail-2.0.1.jar"
javac -cp "lib/*;$mail" -d out src/com/garage/AppConfig.java src/com/garage/EmailService.java src/com/garage/GarageServiceApp.java
java -cp "out;lib/*;$mail" com.garage.GarageServiceApp
```

## Security note
If SMTP keys were ever committed, rotate them immediately in Brevo and use only environment variables or `.env`.
