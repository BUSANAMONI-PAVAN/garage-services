const express = require("express");
const fs = require("fs");
const path = require("path");
const emailService = require("./services/emailService");

function loadEnvFromFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const fileContent = fs.readFileSync(envPath, "utf8");
  fileContent.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex <= 0) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    let value = trimmedLine.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = value;
    }
  });
}

loadEnvFromFile();

const basePort = 5000;
const host = process.env.HOST || "localhost";
const portFile = path.join(__dirname, ".server-port");
const pidFile = path.join(__dirname, ".server-pid");

function createApp(dependencies = {}) {
  const app = express();
  const mailer = dependencies.emailService || emailService;
  const bookings = [];
  let bookingCounter = 1;

  const handleBookingCreate = async (req, res) => {
    const { customerName, customerEmail, serviceType, appointmentDate, notes } =
      req.body || {};

    if (!customerName || !customerEmail || !serviceType || !appointmentDate) {
      return res.status(400).json({
        message:
          "customerName, customerEmail, serviceType, and appointmentDate are required.",
      });
    }

    const booking = {
      id: bookingCounter++,
      customerName,
      customerEmail,
      serviceType,
      appointmentDate,
      notes: notes || "",
      createdAt: new Date().toISOString(),
    };

    bookings.push(booking);

    try {
      const result = await mailer.sendBookingConfirmation(booking);
      return res.status(201).json({
        message: "Booking created and confirmation email sent.",
        booking,
        email: {
          sent: true,
          messageId: result.messageId,
        },
      });
    } catch (error) {
      const smtpError = mailer.normalizeSmtpError(error);
      return res.status(502).json({
        message: "Booking created, but confirmation email failed.",
        booking,
        email: {
          sent: false,
          code: smtpError.code,
          details: smtpError.message,
        },
      });
    }
  };

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    return next();
  });

  app.use(express.json());

  app.get("/", (req, res) => {
    return res.status(200).send({
      message: "Hello World!",
    });
  });

  app.get("/app", (req, res) => {
    return res.status(200).json({
      message: "Garage Services backend is running.",
      bookingApi: "/api/bookings",
    });
  });

  app.get("/app/*", (req, res) => {
    return res.status(200).json({
      message: "Garage Services backend is running.",
      path: req.path,
      bookingApi: "/api/bookings",
    });
  });

  app.get("/api/bookings", (req, res) => {
    return res.status(200).json({
      count: bookings.length,
      bookings,
    });
  });

  app.post("/api/bookings", handleBookingCreate);
  app.post("/book", handleBookingCreate);

  return app;
}

function startServer(app, port) {
  const server = app.listen(port, host, () => {
    const actualPort = server.address().port;
    fs.writeFileSync(portFile, String(actualPort), "utf8");
    fs.writeFileSync(pidFile, String(process.pid), "utf8");
    console.log(`Listening on http://${host}:${actualPort}`);
  });

  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE") {
      console.error(
        `Port ${basePort} is already in use. Run stop-project.cmd or free port ${basePort}, then restart.`
      );
      process.exit(1);
      return;
    }

    console.error("Server failed to start:", err.message);
    process.exit(1);
  });

  return server;
}

const app = createApp();

if (require.main === module) {
  const smtpConfig = emailService.readSmtpConfig();
  if (!smtpConfig.user || !smtpConfig.pass || !smtpConfig.from) {
    console.warn(
      "SMTP is not configured. Set SMTP_USER/SMTP_PASS/SMTP_FROM or JAVA_SMTP_USER/JAVA_SMTP_PASS/JAVA_SMTP_FROM."
    );
  }
  startServer(app, basePort);
}

module.exports = app;
module.exports.createApp = createApp;
module.exports.startServer = startServer;
