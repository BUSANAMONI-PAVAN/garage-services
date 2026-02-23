const nodemailer = require("nodemailer");

function readSmtpConfig() {
  const fallbackHost = process.env.JAVA_SMTP_HOST || "smtp-relay.brevo.com";
  const fallbackPort = process.env.JAVA_SMTP_PORT || 587;
  const fallbackUser = process.env.JAVA_SMTP_USER || "";
  const fallbackPass = process.env.JAVA_SMTP_PASS || "";
  const fallbackFrom = process.env.JAVA_SMTP_FROM || "";

  return {
    host: process.env.SMTP_HOST || fallbackHost,
    port: Number(process.env.SMTP_PORT || fallbackPort),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    user: process.env.SMTP_USER || fallbackUser,
    pass: process.env.SMTP_PASS || fallbackPass,
    from: process.env.SMTP_FROM || fallbackFrom,
  };
}

function normalizeSmtpError(error) {
  const message = String(
    (error && (error.response || error.message || error.code)) || "Unknown SMTP error"
  );
  const lower = message.toLowerCase();

  if (
    (error && (error.code === "EAUTH" || error.responseCode === 535)) ||
    lower.includes("authentication failed")
  ) {
    return {
      code: "SMTP_AUTH_FAILED",
      message:
        "SMTP authentication failed. Check Brevo SMTP username/password and account status.",
    };
  }

  if (lower.includes("relay") && lower.includes("denied")) {
    return {
      code: "SMTP_RELAY_DENIED",
      message:
        "SMTP relay denied. Verify Brevo sender/domain permissions and recipient policy.",
    };
  }

  if (
    lower.includes("sender address rejected") ||
    lower.includes("unverified sender") ||
    lower.includes("sender not verified")
  ) {
    return {
      code: "SMTP_UNVERIFIED_SENDER",
      message:
        "Sender is not verified in Brevo. Verify SMTP_FROM before sending booking emails.",
    };
  }

  if (error && error.code === "SMTP_CONFIG_ERROR") {
    return {
      code: "SMTP_CONFIG_ERROR",
      message: error.message,
    };
  }

  return {
    code: "SMTP_SEND_FAILED",
    message: "Failed to send confirmation email through SMTP.",
  };
}

let transporter;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const config = readSmtpConfig();

  if (!config.user || !config.pass || !config.from) {
    const error = new Error(
      "SMTP_USER/SMTP_PASS/SMTP_FROM (or JAVA_SMTP_USER/JAVA_SMTP_PASS/JAVA_SMTP_FROM) are required."
    );
    error.code = "SMTP_CONFIG_ERROR";
    throw error;
  }

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  return transporter;
}

async function sendBookingConfirmation(booking) {
  const config = readSmtpConfig();
  const client = getTransporter();
  const subject = `Booking Confirmed: ${booking.serviceType}`;
  const text = [
    `Hi ${booking.customerName},`,
    "",
    "Your garage service booking is confirmed.",
    `Booking ID: ${booking.id}`,
    `Service: ${booking.serviceType}`,
    `Appointment: ${booking.appointmentDate}`,
    booking.notes ? `Notes: ${booking.notes}` : "",
    "",
    "Thank you.",
  ]
    .filter(Boolean)
    .join("\n");

  return client.sendMail({
    from: config.from,
    to: booking.customerEmail,
    subject,
    text,
  });
}

module.exports = {
  normalizeSmtpError,
  readSmtpConfig,
  sendBookingConfirmation,
};
