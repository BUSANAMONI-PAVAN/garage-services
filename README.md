# garage-services

This repository includes:
- A Java Swing desktop app (`src/com/garage/GarageServiceApp.java`)
- A Node.js Express backend (`server.js`) for optional API mode

## Run as Desktop App (no localhost:5000)
1. Copy `.env.example` to `.env`.
2. Set database values in `.env`:
   - `JAVA_DB_URL`
   - `JAVA_DB_USER`
   - `JAVA_DB_PASSWORD`
3. Create tables:

```powershell
mysql -u root -p < sql/setup.sql
```

4. Launch desktop UI:

```powershell
.\run-desktop.cmd
```

Alternative:

```powershell
npm.cmd start
```

This opens the Swing application directly and does not use a browser URL.
The launcher keeps Maven artifacts under project-local `.m2/`.

## Optional Email for Desktop Bookings
Set these only if you want email sending from the desktop app:
- `JAVA_EMAIL_ENABLED=true`
- `JAVA_SMTP_USER`
- `JAVA_SMTP_PASS`
- `JAVA_SMTP_FROM`
- Optional: `JAVA_SMTP_HOST` (default `smtp-relay.brevo.com`), `JAVA_SMTP_PORT` (default `587`), `JAVA_SMTP_SECURE`

Notes:
- For Gmail, `JAVA_SMTP_PASS` must be a Google App Password (not your normal account password).
- For Brevo, use Brevo SMTP credentials (SMTP login + SMTP key).
- Java desktop email accepts either `JAVA_SMTP_*` or `SMTP_*` values from `.env`.
- Verify SMTP credentials quickly:
  - `npm.cmd run verify:smtp`

## Optional Backend Mode (localhost:5000)
If you still want server mode:

```powershell
.\run-project.cmd
```

or

```powershell
npm.cmd run start:server
```
