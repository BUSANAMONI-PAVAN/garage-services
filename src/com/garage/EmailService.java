package com.garage;

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.util.Locale;
import java.util.Properties;

public class EmailService {

    private static final String DEFAULT_SMTP_HOST = "smtp-relay.brevo.com";
    private static final String DEFAULT_SMTP_PORT = "587";
    private static final String SMTP_TIMEOUT_MS = "15000";

    public static void sendEmail(String toEmail, String subject, String body) {
        SmtpConfig smtp = readSmtpConfig();
        Session session = createSession(smtp);

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(smtp.from));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
            message.setSubject(subject);
            message.setText(body);

            Transport.send(message);
            System.out.println("Email sent successfully!");
        } catch (MessagingException error) {
            throw new RuntimeException(buildEmailFailureMessage(error), error);
        }
    }

    private static Session createSession(SmtpConfig smtp) {
        Properties props = new Properties();
        props.put("mail.smtp.host", smtp.host);
        props.put("mail.smtp.port", smtp.port);
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.connectiontimeout", SMTP_TIMEOUT_MS);
        props.put("mail.smtp.timeout", SMTP_TIMEOUT_MS);
        props.put("mail.smtp.writetimeout", SMTP_TIMEOUT_MS);

        if (smtp.secure) {
            props.put("mail.smtp.ssl.enable", "true");
        } else {
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
        }

        if (isGmailHost(smtp.host)) {
            props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
        }

        return Session.getInstance(
                props,
                new Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(smtp.user, smtp.pass);
                    }
                }
        );
    }

    private static SmtpConfig readSmtpConfig() {
        String host = firstNonBlank(
                AppConfig.get("JAVA_SMTP_HOST"),
                AppConfig.get("SMTP_HOST"),
                DEFAULT_SMTP_HOST
        );
        String port = firstNonBlank(
                AppConfig.get("JAVA_SMTP_PORT"),
                AppConfig.get("SMTP_PORT"),
                DEFAULT_SMTP_PORT
        );
        String user = firstNonBlank(
                AppConfig.get("JAVA_SMTP_USER"),
                AppConfig.get("SMTP_USER")
        );
        String pass = firstNonBlank(
                AppConfig.get("JAVA_SMTP_PASS"),
                AppConfig.get("SMTP_PASS")
        );
        String from = firstNonBlank(
                AppConfig.get("JAVA_SMTP_FROM"),
                AppConfig.get("SMTP_FROM"),
                user
        );
        String secureText = firstNonBlank(
                AppConfig.get("JAVA_SMTP_SECURE"),
                AppConfig.get("SMTP_SECURE")
        );

        boolean secure = secureText.isBlank()
                ? "465".equals(port.trim())
                : Boolean.parseBoolean(secureText);

        StringBuilder missing = new StringBuilder();
        appendIfMissing(missing, "SMTP_USER", user);
        appendIfMissing(missing, "SMTP_PASS", pass);
        appendIfMissing(missing, "SMTP_FROM", from);

        if (missing.length() > 0) {
            throw new IllegalStateException(
                    "Missing required SMTP configuration: " + missing
                            + ". Set either JAVA_SMTP_* or SMTP_* values in .env."
            );
        }

        return new SmtpConfig(host, port, user, normalizePassword(pass, host), from, secure);
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }

    private static String normalizePassword(String password, String host) {
        if (password == null) {
            return "";
        }

        String trimmed = password.trim();
        if (isGmailHost(host)) {
            // App passwords are often copied with spaces; Gmail expects no spaces.
            return trimmed.replace(" ", "");
        }
        return trimmed;
    }

    private static boolean isGmailHost(String host) {
        if (host == null) {
            return false;
        }
        return host.toLowerCase(Locale.ROOT).contains("gmail.com");
    }

    private static String buildEmailFailureMessage(MessagingException error) {
        String message = error.getMessage() == null ? "" : error.getMessage();
        String lower = message.toLowerCase(Locale.ROOT);

        if (lower.contains("535") || lower.contains("authentication failed") || lower.contains("username and password not accepted")) {
            return "Email send failed: SMTP authentication failed. "
                    + "Use a valid Gmail App Password or a valid Brevo SMTP key.";
        }

        return "Email send failed: " + (message.isBlank() ? "Unknown SMTP error." : message);
    }

    private static void appendIfMissing(StringBuilder missing, String key, String value) {
        if (value == null || value.isBlank()) {
            if (missing.length() > 0) {
                missing.append(", ");
            }
            missing.append(key);
        }
    }

    private static final class SmtpConfig {
        private final String host;
        private final String port;
        private final String user;
        private final String pass;
        private final String from;
        private final boolean secure;

        private SmtpConfig(String host, String port, String user, String pass, String from, boolean secure) {
            this.host = host;
            this.port = port;
            this.user = user;
            this.pass = pass;
            this.from = from;
            this.secure = secure;
        }
    }
}
