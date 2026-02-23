package com.garage;

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;

public class EmailService {

    private static final String DEFAULT_SMTP_HOST = "smtp-relay.brevo.com";
    private static final String DEFAULT_SMTP_PORT = "587";

    public static void sendEmail(String toEmail, String subject, String body) {
        SmtpConfig smtp = readSmtpConfig();

        Properties props = new Properties();
        props.put("mail.smtp.host", smtp.host);
        props.put("mail.smtp.port", smtp.port);
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        Session session = Session.getInstance(
                props,
                new Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(smtp.user, smtp.pass);
                    }
                }
        );

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(smtp.from));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
            message.setSubject(subject);
            message.setText(body);

            Transport.send(message);
            System.out.println("Email sent successfully!");
        } catch (MessagingException error) {
            throw new RuntimeException("Email send failed: " + error.getMessage(), error);
        }
    }

    private static SmtpConfig readSmtpConfig() {
        String host = AppConfig.getOrDefault("JAVA_SMTP_HOST", DEFAULT_SMTP_HOST);
        String port = AppConfig.getOrDefault("JAVA_SMTP_PORT", DEFAULT_SMTP_PORT);
        String user = AppConfig.get("JAVA_SMTP_USER");
        String pass = AppConfig.get("JAVA_SMTP_PASS");
        String from = AppConfig.get("JAVA_SMTP_FROM");

        StringBuilder missing = new StringBuilder();
        appendIfMissing(missing, "JAVA_SMTP_USER", user);
        appendIfMissing(missing, "JAVA_SMTP_PASS", pass);
        appendIfMissing(missing, "JAVA_SMTP_FROM", from);

        if (missing.length() > 0) {
            throw new IllegalStateException(
                    "Missing required SMTP configuration: " + missing +
                            ". Set values in environment variables or .env."
            );
        }

        return new SmtpConfig(host, port, user, pass, from);
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

        private SmtpConfig(String host, String port, String user, String pass, String from) {
            this.host = host;
            this.port = port;
            this.user = user;
            this.pass = pass;
            this.from = from;
        }
    }
}
