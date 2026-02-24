package com.garage;

import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import java.awt.Color;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.HeadlessException;
import java.awt.Insets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

public class GarageServiceApp {

    private static final double TWO_WHEELER_COST = 500.0;
    private static final double THREE_WHEELER_COST = 750.0;
    private static final double FOUR_WHEELER_COST = 1000.0;

    private final String dbUrl;
    private final String dbUser;
    private final String dbPassword;

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException error) {
            System.err.println("MySQL driver not found: " + error.getMessage());
        }
    }

    public GarageServiceApp(String dbUrl, String dbUser, String dbPassword) {
        this.dbUrl = dbUrl;
        this.dbUser = dbUser;
        this.dbPassword = dbPassword;

        JFrame frame = new JFrame("Garage Services");
        frame.setSize(500, 600);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLayout(new GridBagLayout());
        frame.getContentPane().setBackground(new Color(230, 230, 250));

        JLabel selectLabel = new JLabel("Select Vehicle Type:");
        JButton bikeButton = new JButton("2 Wheeler");
        JButton threeButton = new JButton("3 Wheeler");
        JButton fourButton = new JButton("4 Wheeler");
        JCheckBox premium = new JCheckBox("Premium Membership");

        JLabel nameLabel = new JLabel("Name:");
        JTextField nameField = new JTextField(15);

        JLabel emailLabel = new JLabel("Email:");
        JTextField emailField = new JTextField(15);

        JComboBox<String> vehicleCombo =
                new JComboBox<>(new String[]{"2 Wheeler", "3 Wheeler", "4 Wheeler"});

        JButton bookButton = new JButton("Book Now");

        JLabel costLabel = new JLabel("Service Cost: Rs.0");
        costLabel.setForeground(new Color(0, 102, 204));

        JLabel feedbackLabel = new JLabel("Customer Feedback:");
        JTextArea feedbackArea = new JTextArea(3, 20);
        JButton feedbackButton = new JButton("Submit Feedback");

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(10, 10, 10, 10);

        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.gridwidth = 3;
        frame.add(selectLabel, gbc);

        gbc.gridwidth = 1;
        gbc.gridy = 1;
        frame.add(bikeButton, gbc);
        gbc.gridx = 1;
        frame.add(threeButton, gbc);
        gbc.gridx = 2;
        frame.add(fourButton, gbc);

        gbc.gridx = 0;
        gbc.gridy = 2;
        gbc.gridwidth = 3;
        frame.add(premium, gbc);

        gbc.gridwidth = 1;
        gbc.gridy = 3;
        gbc.gridx = 0;
        frame.add(nameLabel, gbc);
        gbc.gridx = 1;
        gbc.gridwidth = 2;
        frame.add(nameField, gbc);

        gbc.gridy = 4;
        gbc.gridx = 0;
        gbc.gridwidth = 1;
        frame.add(emailLabel, gbc);
        gbc.gridx = 1;
        gbc.gridwidth = 2;
        frame.add(emailField, gbc);

        gbc.gridy = 5;
        gbc.gridx = 0;
        gbc.gridwidth = 1;
        frame.add(vehicleCombo, gbc);
        gbc.gridx = 1;
        gbc.gridwidth = 2;
        frame.add(bookButton, gbc);

        gbc.gridy = 6;
        gbc.gridx = 0;
        gbc.gridwidth = 3;
        frame.add(costLabel, gbc);

        gbc.gridy = 7;
        frame.add(feedbackLabel, gbc);

        gbc.gridy = 8;
        frame.add(new JScrollPane(feedbackArea), gbc);

        gbc.gridy = 9;
        frame.add(feedbackButton, gbc);

        bikeButton.addActionListener(e ->
                updateServiceCost("2 Wheeler", premium.isSelected(), costLabel));
        threeButton.addActionListener(e ->
                updateServiceCost("3 Wheeler", premium.isSelected(), costLabel));
        fourButton.addActionListener(e ->
                updateServiceCost("4 Wheeler", premium.isSelected(), costLabel));
        premium.addActionListener(e ->
                updateServiceCost((String) vehicleCombo.getSelectedItem(), premium.isSelected(), costLabel));
        bookButton.addActionListener(e ->
                handleBooking(nameField, emailField, vehicleCombo, premium));
        feedbackButton.addActionListener(e -> handleFeedback(feedbackArea));

        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private void handleBooking(
            JTextField nameField,
            JTextField emailField,
            JComboBox<String> vehicleCombo,
            JCheckBox premium
    ) {
        String name = nameField.getText().trim();
        String email = emailField.getText().trim();
        String vehicleType = (String) vehicleCombo.getSelectedItem();
        boolean isPremium = premium.isSelected();
        double cost = calculateCost(vehicleType, isPremium);

        if (name.isEmpty() || email.isEmpty()) {
            JOptionPane.showMessageDialog(
                    null,
                    "Please enter Name and Email.",
                    "Error",
                    JOptionPane.ERROR_MESSAGE
            );
            return;
        }

        if (saveBookingToDatabase(name, email, vehicleType, cost)) {
            // Email can be toggled by JAVA_EMAIL_ENABLED and uses SMTP values from .env.
            String emailEnabled = AppConfig.getOrDefault("JAVA_EMAIL_ENABLED", "false");
            
            if ("true".equalsIgnoreCase(emailEnabled)) {
                try {
                    String emailBody = "🚗 Welcome to Our Garage Services! 🚗\n\n"
                            + "Dear " + name + ",\n\n"
                            + "Great news! Your service booking has been confirmed.\n\n"
                            + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                            + "📋 BOOKING DETAILS\n"
                            + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                            + "Vehicle Type: " + vehicleType + "\n"
                            + "Service Package: " + (isPremium ? "Premium ⭐" : "Standard") + "\n"
                            + "Total Cost: Rs. " + String.format("%.2f", cost) + "\n"
                            + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
                            + "✨ What's Next?\n"
                            + "• Our team will contact you shortly to schedule your service\n"
                            + "• Please bring your vehicle at the scheduled time\n"
                            + "• Our expert technicians will take care of everything!\n\n"
                            + "💡 Need to reschedule or have questions?\n"
                            + "Feel free to reach out to us anytime.\n\n"
                            + "Our contact details:\n"
                            + "📞 Phone: +91 9876543210\n"
                            + "📧 Email: support@garageservices.com\n"
                            + "🌐 Website: www.garageservices.com\n\n"
                            + "Thank you for choosing our services! We look forward to serving you.\n\n"
                            + "Best regards,\n"
                            + "Your Garage Services Team\n"
                            + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
                    
                    EmailService.sendEmail(
                            email,
                            "🎉 Your Garage Service Booking is Confirmed!",
                            emailBody
                    );
                    JOptionPane.showMessageDialog(null, "Booking successful! Confirmation email sent.");
                } catch (Exception emailError) {
                    String errorMessage = simplifyEmailError(emailError);
                    JOptionPane.showMessageDialog(
                            null,
                            "Booking saved successfully!\n\n(Email sending failed: " + errorMessage + ")",
                            "Booking Confirmed",
                            JOptionPane.INFORMATION_MESSAGE
                    );
                    System.err.println("Email error: " + errorMessage);
                }
            } else {
                JOptionPane.showMessageDialog(
                        null,
                        "Booking successful!\n\nName: " + name + "\nEmail: " + email + "\nVehicle: " + vehicleType + "\nCost: Rs." + cost,
                        "Booking Confirmed",
                        JOptionPane.INFORMATION_MESSAGE
                );
            }

            nameField.setText("");
            emailField.setText("");
        }
    }

    private static String simplifyEmailError(Throwable error) {
        Throwable cursor = error;
        while (cursor.getCause() != null && cursor.getCause() != cursor) {
            cursor = cursor.getCause();
        }

        String message = cursor.getMessage();
        if (message == null || message.isBlank()) {
            message = error.getMessage();
        }
        if (message == null || message.isBlank()) {
            return "Unknown email error.";
        }

        return message.replace("Email send failed: Email send failed:", "Email send failed:");
    }

    private static void handleFeedback(JTextArea feedbackArea) {
        String feedback = feedbackArea.getText().trim();
        if (feedback.isEmpty()) {
            JOptionPane.showMessageDialog(
                    null,
                    "Enter feedback first.",
                    "Error",
                    JOptionPane.ERROR_MESSAGE
            );
            return;
        }

        saveFeedbackToDatabase(feedback);
        JOptionPane.showMessageDialog(null, "Feedback submitted.");
        feedbackArea.setText("");
    }

    private static double calculateCost(String vehicleType, boolean premium) {
        double baseCost = switch (vehicleType) {
            case "2 Wheeler" -> TWO_WHEELER_COST;
            case "3 Wheeler" -> THREE_WHEELER_COST;
            case "4 Wheeler" -> FOUR_WHEELER_COST;
            default -> 0;
        };

        return premium ? baseCost * 0.9 : baseCost;
    }

    private static void updateServiceCost(String vehicleType, boolean premium, JLabel label) {
        label.setText("Service Cost: Rs." + calculateCost(vehicleType, premium));
    }

    private boolean saveBookingToDatabase(String name, String email, String vehicleType, double cost) {
        String sql = "INSERT INTO GarageServiceBookings (name, email, wheeler_type, cost) VALUES (?, ?, ?, ?)";

        try (
                Connection connection = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
                PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setString(1, name);
            statement.setString(2, email);
            statement.setString(3, vehicleType);
            statement.setDouble(4, cost);
            statement.executeUpdate();
            return true;
        } catch (SQLException error) {
            JOptionPane.showMessageDialog(
                    null,
                    error.getMessage(),
                    "Database Error",
                    JOptionPane.ERROR_MESSAGE
            );
            return false;
        }
    }

    private static void saveFeedbackToDatabase(String feedback) {
        String dbUrl = AppConfig.get("JAVA_DB_URL");
        String dbUser = AppConfig.get("JAVA_DB_USER");
        String dbPassword = AppConfig.get("JAVA_DB_PASSWORD");
        String sql = "INSERT INTO CustomerFeedback (feedback_text) VALUES (?)";

        try (
                Connection connection = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
                PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setString(1, feedback);
            statement.executeUpdate();
        } catch (SQLException error) {
            System.err.println("Could not save feedback: " + error.getMessage());
        }
    }

    private static void showStartupError(String message) {
        System.err.println(message);
        try {
            JOptionPane.showMessageDialog(null, message, "Configuration Error", JOptionPane.ERROR_MESSAGE);
        } catch (HeadlessException ignored) {
            // Ignore headless environments and keep console message.
        }
    }

    public static void main(String[] args) {
        List<String> missingDb = AppConfig.missing("JAVA_DB_URL", "JAVA_DB_USER");
        if (!missingDb.isEmpty()) {
            showStartupError(
                    "Missing required database configuration: "
                            + String.join(", ", missingDb)
                            + ". Set values in environment variables or .env."
            );
            return;
        }

        // Allow empty password (some MySQL installations have no root password)
        String dbPassword = AppConfig.get("JAVA_DB_PASSWORD");

        new GarageServiceApp(
                AppConfig.get("JAVA_DB_URL"),
                AppConfig.get("JAVA_DB_USER"),
                dbPassword
        );
    }
}
