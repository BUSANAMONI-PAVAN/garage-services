const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const values = {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in values)) {
      values[key] = value;
    }
  }

  return values;
}

function firstNonBlank(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }
  return "";
}

function readSmtpConfig(dotEnv) {
  const host = firstNonBlank(
    process.env.JAVA_SMTP_HOST,
    process.env.SMTP_HOST,
    dotEnv.JAVA_SMTP_HOST,
    dotEnv.SMTP_HOST,
    "smtp-relay.brevo.com"
  );
  const portText = firstNonBlank(
    process.env.JAVA_SMTP_PORT,
    process.env.SMTP_PORT,
    dotEnv.JAVA_SMTP_PORT,
    dotEnv.SMTP_PORT,
    "587"
  );
  const secureText = firstNonBlank(
    process.env.JAVA_SMTP_SECURE,
    process.env.SMTP_SECURE,
    dotEnv.JAVA_SMTP_SECURE,
    dotEnv.SMTP_SECURE
  );
  const user = firstNonBlank(
    process.env.JAVA_SMTP_USER,
    process.env.SMTP_USER,
    dotEnv.JAVA_SMTP_USER,
    dotEnv.SMTP_USER
  );
  const pass = firstNonBlank(
    process.env.JAVA_SMTP_PASS,
    process.env.SMTP_PASS,
    dotEnv.JAVA_SMTP_PASS,
    dotEnv.SMTP_PASS
  );

  const port = Number(portText || 587);
  const secure =
    secureText === "" ? port === 465 : String(secureText).toLowerCase() === "true";
  const isGmail = host.toLowerCase().includes("gmail.com");
  const normalizedPass = isGmail ? pass.replace(/ /g, "") : pass;

  return { host, port, secure, user, pass: normalizedPass };
}

async function main() {
  const dotEnv = loadDotEnv(path.join(process.cwd(), ".env"));
  const smtp = readSmtpConfig(dotEnv);

  if (!smtp.user || !smtp.pass || !smtp.host) {
    console.error(
      "SMTP config missing. Set JAVA_SMTP_* or SMTP_* values in .env before verifying."
    );
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 12000,
  });

  try {
    await transporter.verify();
    console.log(`SMTP verify OK: ${smtp.host}:${smtp.port}`);
    process.exit(0);
  } catch (error) {
    const code = error && error.code ? error.code : "UNKNOWN";
    const responseCode = error && error.responseCode ? error.responseCode : "NA";
    const message = String(error && error.message ? error.message : "Unknown SMTP error")
      .split("\n")[0]
      .trim();

    console.error(`SMTP verify FAILED: ${smtp.host}:${smtp.port}`);
    console.error(`code=${code} responseCode=${responseCode}`);
    console.error(`message=${message}`);
    console.error(
      "Tip: For Gmail use a Google App Password. For Brevo use SMTP login + SMTP key."
    );
    process.exit(1);
  }
}

main();
