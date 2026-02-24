package com.garage;

import javax.swing.*;
import javax.swing.border.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.*;
import java.sql.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class ModernGarageApp extends JFrame {
    
    // Color scheme
    private static final Color PRIMARY_COLOR = new Color(41, 128, 185);
    private static final Color SECONDARY_COLOR = new Color(52, 73, 94);
    private static final Color ACCENT_COLOR = new Color(46, 204, 113);
    private static final Color BACKGROUND_COLOR = new Color(236, 240, 241);
    private static final Color CARD_COLOR = Color.WHITE;
    private static final Color TEXT_COLOR = new Color(44, 62, 80);
    
    // Database credentials
    private final String dbUrl;
    private final String dbUser;
    private final String dbPassword;
    
    // Current logged-in user
    private Integer currentUserId = null;
    private String currentUserName = null;
    
    // Main components
    private JTabbedPane tabbedPane;
    private JPanel loginPanel;
    private JPanel dashboardPanel;
    private JPanel bookingPanel;
    private JPanel historyPanel;
    private JPanel settingsPanel;
    
    // Service costs (loaded from settings)
    private double twoWheelerCost = 500.0;
    private double threeWheelerCost = 750.0;
    private double fourWheelerCost = 1000.0;
    private double premiumDiscount = 10.0;
    
    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
    
    public ModernGarageApp(String dbUrl, String dbUser, String dbPassword) {
        this.dbUrl = dbUrl;
        this.dbUser = dbUser;
        this.dbPassword = dbPassword;
        
        loadSettings();
        initializeUI();
    }
    
    private void initializeUI() {
        setTitle("🚗 Premium Garage Services - Management System");
        setSize(1100, 750);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        
        // Set modern look and feel
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        getContentPane().setBackground(BACKGROUND_COLOR);
        setLayout(new BorderLayout());
        
        // Show login screen first
        showLoginScreen();
        
        setVisible(true);
    }
    
    private void showLoginScreen() {
        getContentPane().removeAll();
        
        JPanel mainPanel = new JPanel(new GridBagLayout());
        mainPanel.setBackground(BACKGROUND_COLOR);
        
        JPanel loginCard = createStyledPanel();
        loginCard.setLayout(new BoxLayout(loginCard, BoxLayout.Y_AXIS));
        loginCard.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(PRIMARY_COLOR, 2, true),
                new EmptyBorder(40, 40, 40, 40)
        ));
        loginCard.setPreferredSize(new Dimension(400, 500));
        
        // Logo/Title
        JLabel titleLabel = new JLabel("🚗 Garage Services");
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 28));
        titleLabel.setForeground(PRIMARY_COLOR);
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        JLabel subtitleLabel = new JLabel("Login to your account");
        subtitleLabel.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        subtitleLabel.setForeground(TEXT_COLOR);
        subtitleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        // Username field
        JLabel usernameLabel = createStyledLabel("Username");
        JTextField usernameField = createStyledTextField();
        
        // Password field
        JLabel passwordLabel = createStyledLabel("Password");
        JPasswordField passwordField = createStyledPasswordField();
        
        // Buttons
        JButton loginButton = createStyledButton("Login", PRIMARY_COLOR);
        JButton registerButton = createStyledButton("Create Account", ACCENT_COLOR);
        JButton guestButton = createStyledButton("Continue as Guest", SECONDARY_COLOR);
        
        loginButton.addActionListener(e -> handleLogin(usernameField.getText(), new String(passwordField.getPassword())));
        registerButton.addActionListener(e -> showRegisterDialog());
        guestButton.addActionListener(e -> {
            currentUserId = null;
            currentUserName = "Guest";
            showMainApplication();
        });
        
        // Add components
        loginCard.add(titleLabel);
        loginCard.add(Box.createRigidArea(new Dimension(0, 10)));
        loginCard.add(subtitleLabel);
        loginCard.add(Box.createRigidArea(new Dimension(0, 30)));
        
        loginCard.add(usernameLabel);
        loginCard.add(Box.createRigidArea(new Dimension(0, 5)));
        loginCard.add(usernameField);
        loginCard.add(Box.createRigidArea(new Dimension(0, 20)));
        
        loginCard.add(passwordLabel);
        loginCard.add(Box.createRigidArea(new Dimension(0, 5)));
        loginCard.add(passwordField);
        loginCard.add(Box.createRigidArea(new Dimension(0, 30)));
        
        loginCard.add(loginButton);
        loginCard.add(Box.createRigidArea(new Dimension(0, 10)));
        loginCard.add(registerButton);
        loginCard.add(Box.createRigidArea(new Dimension(0, 10)));
        loginCard.add(guestButton);
        
        mainPanel.add(loginCard);
        add(mainPanel, BorderLayout.CENTER);
        
        revalidate();
        repaint();
    }
    
    private void showRegisterDialog() {
        JDialog registerDialog = new JDialog(this, "Create Account", true);
        registerDialog.setSize(450, 550);
        registerDialog.setLocationRelativeTo(this);
        registerDialog.setLayout(new BorderLayout());
        
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setBorder(new EmptyBorder(30, 30, 30, 30));
        panel.setBackground(Color.WHITE);
        
        JLabel titleLabel = new JLabel("Create New Account");
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 20));
        titleLabel.setForeground(PRIMARY_COLOR);
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        JTextField fullNameField = createStyledTextField();
        JTextField usernameField = createStyledTextField();
        JTextField emailField = createStyledTextField();
        JTextField phoneField = createStyledTextField();
        JPasswordField passwordField = createStyledPasswordField();
        JPasswordField confirmPasswordField = createStyledPasswordField();
        
        panel.add(titleLabel);
        panel.add(Box.createRigidArea(new Dimension(0, 20)));
        panel.add(createStyledLabel("Full Name"));
        panel.add(Box.createRigidArea(new Dimension(0, 5)));
        panel.add(fullNameField);
        panel.add(Box.createRigidArea(new Dimension(0, 15)));
        panel.add(createStyledLabel("Username"));
        panel.add(Box.createRigidArea(new Dimension(0, 5)));
        panel.add(usernameField);
        panel.add(Box.createRigidArea(new Dimension(0, 15)));
        panel.add(createStyledLabel("Email"));
        panel.add(Box.createRigidArea(new Dimension(0, 5)));
        panel.add(emailField);
        panel.add(Box.createRigidArea(new Dimension(0, 15)));
        panel.add(createStyledLabel("Phone"));
        panel.add(Box.createRigidArea(new Dimension(0, 5)));
        panel.add(phoneField);
        panel.add(Box.createRigidArea(new Dimension(0, 15)));
        panel.add(createStyledLabel("Password"));
        panel.add(Box.createRigidArea(new Dimension(0, 5)));
        panel.add(passwordField);
        panel.add(Box.createRigidArea(new Dimension(0, 15)));
        panel.add(createStyledLabel("Confirm Password"));
        panel.add(Box.createRigidArea(new Dimension(0, 5)));
        panel.add(confirmPasswordField);
        panel.add(Box.createRigidArea(new Dimension(0, 20)));
        
        JButton registerBtn = createStyledButton("Register", ACCENT_COLOR);
        registerBtn.addActionListener(e -> {
            String password = new String(passwordField.getPassword());
            String confirmPassword = new String(confirmPasswordField.getPassword());
            
            if (!password.equals(confirmPassword)) {
                JOptionPane.showMessageDialog(registerDialog, "Passwords do not match!", "Error", JOptionPane.ERROR_MESSAGE);
                return;
            }
            
            if (registerUser(usernameField.getText(), password, fullNameField.getText(), 
                           emailField.getText(), phoneField.getText())) {
                JOptionPane.showMessageDialog(registerDialog, "Account created successfully! Please login.", 
                                            "Success", JOptionPane.INFORMATION_MESSAGE);
                registerDialog.dispose();
            }
        });
        
        panel.add(registerBtn);
        
        JScrollPane scrollPane = new JScrollPane(panel);
        scrollPane.setBorder(null);
        registerDialog.add(scrollPane, BorderLayout.CENTER);
        
        registerDialog.setVisible(true);
    }
    
    private boolean registerUser(String username, String password, String fullName, String email, String phone) {
        String sql = "INSERT INTO Users (username, password, full_name, email, phone) VALUES (?, ?, ?, ?, ?)";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, username);
            stmt.setString(2, password); // In production, hash the password!
            stmt.setString(3, fullName);
            stmt.setString(4, email);
            stmt.setString(5, phone);
            stmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Registration failed: " + e.getMessage(), 
                                        "Error", JOptionPane.ERROR_MESSAGE);
            return false;
        }
    }
    
    private void handleLogin(String username, String password) {
        if (username.isEmpty() || password.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Please enter username and password", 
                                        "Error", JOptionPane.ERROR_MESSAGE);
            return;
        }
        
        String sql = "SELECT id, full_name FROM Users WHERE username = ? AND password = ?";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, username);
            stmt.setString(2, password); //  In production, compare hashed passwords!
            
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                currentUserId = rs.getInt("id");
                currentUserName = rs.getString("full_name");
                showMainApplication();
            } else {
                JOptionPane.showMessageDialog(this, "Invalid username or password", 
                                            "Error", JOptionPane.ERROR_MESSAGE);
            }
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Login failed: " + e.getMessage(), 
                                        "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void showMainApplication() {
        getContentPane().removeAll();
        
        // Create menubar
        JMenuBar menuBar = new JMenuBar();
        menuBar.setBackground(CARD_COLOR);
        
        JLabel welcomeLabel = new JLabel("   Welcome, " + currentUserName + "! 👤");
        welcomeLabel.setFont(new Font("Segoe UI", Font.BOLD, 14));
        welcomeLabel.setForeground(PRIMARY_COLOR);
        
        JButton logoutButton = createSmallButton("Logout");
        logoutButton.addActionListener(e -> {
            currentUserId = null;
            currentUserName = null;
            showLoginScreen();
        });
        
        menuBar.add(welcomeLabel);
        menuBar.add(Box.createHorizontalGlue());
        menuBar.add(logoutButton);
        
        setJMenuBar(menuBar);
        
        // Create tabbed pane
        tabbedPane = new JTabbedPane();
        tabbedPane.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        tabbedPane.setBackground(CARD_COLOR);
        
        // Create panels
        dashboardPanel = createDashboardPanel();
        bookingPanel = createBookingPanel();
        historyPanel = createHistoryPanel();
        settingsPanel = createSettingsPanel();
        
        // Add tabs with icons (using Unicode emojis)
        tabbedPane.addTab("  📊 Dashboard  ", dashboardPanel);
        tabbedPane.addTab("  📅 New Booking  ", bookingPanel);
        tabbedPane.addTab("  📋 History  ", historyPanel);
        tabbedPane.addTab("  ⚙️ Settings  ", settingsPanel);
        
        add(tabbedPane, BorderLayout.CENTER);
        
        revalidate();
        repaint();
    }
    
    private JPanel createDashboardPanel() {
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBackground(BACKGROUND_COLOR);
        panel.setBorder(new EmptyBorder(20, 20, 20, 20));
        
        // Title
        JLabel titleLabel = new JLabel("📊 Dashboard Overview");
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 24));
        titleLabel.setForeground(TEXT_COLOR);
        
        // Statistics cards
        JPanel statsPanel = new JPanel(new GridLayout(1, 4, 15, 15));
        statsPanel.setBackground(BACKGROUND_COLOR);
        
        int[] stats = getStatistics();
        statsPanel.add(createStatCard("Total Bookings", String.valueOf(stats[0]), "📝", PRIMARY_COLOR));
        statsPanel.add(createStatCard("Pending", String.valueOf(stats[1]), "⏳", new Color(241, 196, 15)));
        statsPanel.add(createStatCard("Completed", String.valueOf(stats[2]), "✅", ACCENT_COLOR));
        statsPanel.add(createStatCard("Total Revenue", "Rs. " + stats[3], "💰", new Color(155, 89, 182)));
        
        // Recent bookings table
        JPanel recentPanel = createStyledPanel();
        recentPanel.setLayout(new BorderLayout(10, 10));
        recentPanel.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(PRIMARY_COLOR, 1, true),
                new EmptyBorder(15, 15, 15, 15)
        ));
        
        JLabel recentLabel = new JLabel("📋 Recent Bookings");
        recentLabel.setFont(new Font("Segoe UI", Font.BOLD, 16));
        recentLabel.setForeground(TEXT_COLOR);
        
        String[] columns = {"ID", "Name", "Vehicle", "Date", "Status", "Cost"};
        DefaultTableModel model = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        
        loadRecentBookings(model, 10);
        
        JTable table = new JTable(model);
        styleTable(table);
        
        JScrollPane scrollPane = new JScrollPane(table);
        scrollPane.setBorder(null);
        
        recentPanel.add(recentLabel, BorderLayout.NORTH);
        recentPanel.add(scrollPane, BorderLayout.CENTER);
        
        // Assemble dashboard
        JPanel topPanel = new JPanel(new BorderLayout());
        topPanel.setBackground(BACKGROUND_COLOR);
        topPanel.add(titleLabel, BorderLayout.NORTH);
        topPanel.add(Box.createRigidArea(new Dimension(0, 20)), BorderLayout.CENTER);
        
        panel.add(topPanel, BorderLayout.NORTH);
        panel.add(statsPanel, BorderLayout.CENTER);
        panel.add(recentPanel, BorderLayout.SOUTH);
        
        return panel;
    }
    
    private JPanel createBookingPanel() {
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBackground(BACKGROUND_COLOR);
        panel.setBorder(new EmptyBorder(20, 20, 20, 20));
        
        JLabel titleLabel = new JLabel("📅 Create New Booking");
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 24));
        titleLabel.setForeground(TEXT_COLOR);
        
        // Form panel
        JPanel formPanel = createStyledPanel();
        formPanel.setLayout(new GridBagLayout());
        formPanel.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(PRIMARY_COLOR, 1, true),
                new EmptyBorder(30, 30, 30, 30)
        ));
        
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(10, 10, 10, 10);
        
        // Customer details
        JTextField nameField = createStyledTextField();
        JTextField emailField = createStyledTextField();
        JTextField phoneField = createStyledTextField();
        
        // Vehicle type
        String[] vehicles = {"2 Wheeler", "3 Wheeler", "4 Wheeler"};
        JComboBox<String> vehicleCombo = new JComboBox<>(vehicles);
        vehicleCombo.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        
        // Service type
        String[] services = {"Standard Service", "Premium Service"};
        JComboBox<String> serviceCombo = new JComboBox<>(services);
        serviceCombo.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        
        // Date time picker (simplified)
        JTextField dateField = createStyledTextField();
        dateField.setText(LocalDateTime.now().plusDays(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        
        JButton datePickerButton = createSmallButton("📅 Pick Date");
        datePickerButton.addActionListener(e -> {
            String date = JOptionPane.showInputDialog(this, "Enter date & time (yyyy-MM-dd HH:mm):", 
                    dateField.getText());
            if (date != null && !date.isEmpty()) {
                dateField.setText(date);
            }
        });
        
        // Notes
        JTextArea notesArea = new JTextArea(3, 20);
        notesArea.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        notesArea.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(PRIMARY_COLOR, 1),
                new EmptyBorder(5, 5, 5, 5)
        ));
        JScrollPane notesScroll = new JScrollPane(notesArea);
        
        // Cost label
        JLabel costLabel = new JLabel("Service Cost: Rs. 0");
        costLabel.setFont(new Font("Segoe UI", Font.BOLD, 18));
        costLabel.setForeground(PRIMARY_COLOR);
        
        // Update cost when selections change
        ActionListener costUpdater = e -> {
            String vehicle = (String) vehicleCombo.getSelectedItem();
            boolean isPremium = serviceCombo.getSelectedIndex() == 1;
            double cost = calculateCost(vehicle, isPremium);
            costLabel.setText("Service Cost: Rs. " + String.format("%.2f", cost));
        };
        
        vehicleCombo.addActionListener(costUpdater);
        serviceCombo.addActionListener(costUpdater);
        
        // Service details panel
        JPanel detailsPanel = createStyledPanel();
        detailsPanel.setLayout(new BoxLayout(detailsPanel, BoxLayout.Y_AXIS));
        detailsPanel.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(ACCENT_COLOR, 1, true),
                new EmptyBorder(15, 15, 15, 15)
        ));
        detailsPanel.setBackground(new Color(232, 245, 233));
        
        JLabel detailsTitle = new JLabel("📋 Service Details");
        detailsTitle.setFont(new Font("Segoe UI", Font.BOLD, 14));
        detailsTitle.setAlignmentX(Component.LEFT_ALIGNMENT);
        
        JLabel detail1 = new JLabel("✓ Complete vehicle inspection");
        JLabel detail2 = new JLabel("✓ Oil & filter change");
        JLabel detail3 = new JLabel("✓ Brake system check");
        JLabel detail4 = new JLabel("✓ Tire pressure & alignment");
        JLabel detail5 = new JLabel("✓ 30-day service warranty");
        
        for (JLabel label : new JLabel[]{detail1, detail2, detail3, detail4, detail5}) {
            label.setFont(new Font("Segoe UI", Font.PLAIN, 12));
            label.setAlignmentX(Component.LEFT_ALIGNMENT);
        }
        
        detailsPanel.add(detailsTitle);
        detailsPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        detailsPanel.add(detail1);
        detailsPanel.add(detail2);
        detailsPanel.add(detail3);
        detailsPanel.add(detail4);
        detailsPanel.add(detail5);
        
        // Book button
        JButton bookButton = createStyledButton("🎯 Book Service", ACCENT_COLOR);
        bookButton.setPreferredSize(new Dimension(200, 45));
        bookButton.addActionListener(e -> {
            handleBookingSubmit(nameField, emailField, phoneField, vehicleCombo, 
                              serviceCombo, dateField, notesArea, costLabel);
        });
        
        // Layout components
        int row = 0;
        addFormField(formPanel, gbc, row++, "Customer Name:", nameField);
        addFormField(formPanel, gbc, row++, "Email:", emailField);
        addFormField(formPanel, gbc, row++, "Phone:", phoneField);
        addFormField(formPanel, gbc, row++, "Vehicle Type:", vehicleCombo);
        addFormField(formPanel, gbc, row++, "Service Package:", serviceCombo);
        
        gbc.gridx = 0;
        gbc.gridy = row;
        formPanel.add(createStyledLabel("Appointment Date:"), gbc);
        gbc.gridx = 1;
        JPanel datePanel = new JPanel(new BorderLayout(5, 0));
        datePanel.setBackground(CARD_COLOR);
        datePanel.add(dateField, BorderLayout.CENTER);
        datePanel.add(datePickerButton, BorderLayout.EAST);
        formPanel.add(datePanel, gbc);
        row++;
        
        addFormField(formPanel, gbc, row++, "Notes:", notesScroll);
        
        gbc.gridx = 0;
        gbc.gridy = row++;
        gbc.gridwidth = 2;
        formPanel.add(costLabel, gbc);
        
        gbc.gridy = row++;
        gbc.anchor = GridBagConstraints.CENTER;
        formPanel.add(bookButton, gbc);
        
        // Layout main panel
        JPanel topPanel = new JPanel(new BorderLayout());
        topPanel.setBackground(BACKGROUND_COLOR);
        topPanel.add(titleLabel, BorderLayout.WEST);
        topPanel.add(detailsPanel, BorderLayout.EAST);
        
        panel.add(topPanel, BorderLayout.NORTH);
        panel.add(formPanel, BorderLayout.CENTER);
        
        // Trigger initial cost calculation
        costUpdater.actionPerformed(null);
        
        return panel;
    }
    
    private JPanel createHistoryPanel() {
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBackground(BACKGROUND_COLOR);
        panel.setBorder(new EmptyBorder(20, 20, 20, 20));
        
        JLabel titleLabel = new JLabel("📋 Booking History");
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 24));
        titleLabel.setForeground(TEXT_COLOR);
        
        // Search panel
        JPanel searchPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 10));
        searchPanel.setBackground(CARD_COLOR);
        searchPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        
        JTextField searchField = createStyledTextField();
        searchField.setPreferredSize(new Dimension(250, 35));
        
        JButton searchButton = createStyledButton("🔍 Search", PRIMARY_COLOR);
        JButton refreshButton = createStyledButton("🔄 Refresh", SECONDARY_COLOR);
        
        searchPanel.add(new JLabel("Search:"));
        searchPanel.add(searchField);
        searchPanel.add(searchButton);
        searchPanel.add(refreshButton);
        
        // Table
        String[] columns = {"ID", "Name", "Email", "Phone", "Vehicle", "Service", "Date", "Status", "Cost"};
        DefaultTableModel model = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        
        JTable table = new JTable(model);
        styleTable(table);
        
        JScrollPane scrollPane = new JScrollPane(table);
        scrollPane.setBorder(new LineBorder(PRIMARY_COLOR, 1));
        
        // Load all bookings
        loadAllBookings(model);
        
        searchButton.addActionListener(e -> searchBookings(model, searchField.getText()));
        refreshButton.addActionListener(e -> loadAllBookings(model));
        
        // Action buttons
        JPanel actionPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 10));
        actionPanel.setBackground(BACKGROUND_COLOR);
        
        JButton viewButton = createStyledButton("👁️ View Details", PRIMARY_COLOR);
        JButton updateButton = createStyledButton("✏️ Update Status", ACCENT_COLOR);
        JButton deleteButton = createStyledButton("🗑️ Delete", new Color(231, 76, 60));
        
        viewButton.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row >= 0) {
                showBookingDetails(model, row);
            } else {
                JOptionPane.showMessageDialog(this, "Please select a booking to view");
            }
        });
        
        updateButton.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row >= 0) {
                updateBookingStatus(model, row);
            } else {
                JOptionPane.showMessageDialog(this, "Please select a booking to update");
            }
        });
        
        deleteButton.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row >= 0) {
                int bookingId = (int) model.getValueAt(row, 0);
                int confirm = JOptionPane.showConfirmDialog(this, 
                        "Are you sure you want to delete this booking?", 
                        "Confirm Delete", JOptionPane.YES_NO_OPTION);
                if (confirm == JOptionPane.YES_OPTION) {
                    deleteBooking(bookingId);
                    loadAllBookings(model);
                }
            } else {
                JOptionPane.showMessageDialog(this, "Please select a booking to delete");
            }
        });
        
        actionPanel.add(viewButton);
        actionPanel.add(updateButton);
        actionPanel.add(deleteButton);
        
        panel.add(titleLabel, BorderLayout.NORTH);
        panel.add(searchPanel, BorderLayout.AFTER_LINE_ENDS);
        panel.add(scrollPane, BorderLayout.CENTER);
        panel.add(actionPanel, BorderLayout.SOUTH);
        
        return panel;
    }
    
    private JPanel createSettingsPanel() {
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBackground(BACKGROUND_COLOR);
        panel.setBorder(new EmptyBorder(20, 20, 20, 20));
        
        JLabel titleLabel = new JLabel("⚙️ Application Settings");
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 24));
        titleLabel.setForeground(TEXT_COLOR);
        
        JPanel settingsForm = createStyledPanel();
        settingsForm.setLayout(new GridBagLayout());
        settingsForm.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(PRIMARY_COLOR, 1, true),
                new EmptyBorder(30, 30, 30, 30)
        ));
        
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(10, 10, 10, 10);
        
        // Cost settings
        JTextField twoWheelerField = createStyledTextField();
        twoWheelerField.setText(String.valueOf(twoWheelerCost));
        
        JTextField threeWheelerField = createStyledTextField();
        threeWheelerField.setText(String.valueOf(threeWheelerCost));
        
        JTextField fourWheelerField = createStyledTextField();
        fourWheelerField.setText(String.valueOf(fourWheelerCost));
        
        JTextField discountField = createStyledTextField();
        discountField.setText(String.valueOf(premiumDiscount));
        
        // Business info
        String businessName = getSettingValue("business_name", "Premium Garage Services");
        String businessEmail = getSettingValue("business_email", "contact@garageservices.com");
        String businessPhone = getSettingValue("business_phone", "+1-234-567-8900");
        
        JTextField businessNameField = createStyledTextField();
        businessNameField.setText(businessName);
        
        JTextField businessEmailField = createStyledTextField();
        businessEmailField.setText(businessEmail);
        
        JTextField businessPhoneField = createStyledTextField();
        businessPhoneField.setText(businessPhone);
        
        // Layout
        int row = 0;
        
        // Pricing section
        gbc.gridx = 0;
        gbc.gridy = row++;
        gbc.gridwidth = 2;
        JLabel pricingLabel = new JLabel("💰 Pricing Configuration");
        pricingLabel.setFont(new Font("Segoe UI", Font.BOLD, 16));
        settingsForm.add(pricingLabel, gbc);
        gbc.gridwidth = 1;
        
        addFormField(settingsForm, gbc, row++, "2-Wheeler Cost (Rs.):", twoWheelerField);
        addFormField(settingsForm, gbc, row++, "3-Wheeler Cost (Rs.):", threeWheelerField);
        addFormField(settingsForm, gbc, row++, "4-Wheeler Cost (Rs.):", fourWheelerField);
        addFormField(settingsForm, gbc, row++, "Premium Discount (%):", discountField);
        
        gbc.gridy = row++;
        gbc.gridwidth = 2;
        settingsForm.add(Box.createRigidArea(new Dimension(0, 20)), gbc);
        gbc.gridwidth = 1;
        
        // Business info section
        gbc.gridx = 0;
        gbc.gridy = row++;
        gbc.gridwidth = 2;
        JLabel businessLabel = new JLabel("🏢 Business Information");
        businessLabel.setFont(new Font("Segoe UI", Font.BOLD, 16));
        settingsForm.add(businessLabel, gbc);
        gbc.gridwidth = 1;
        
        addFormField(settingsForm, gbc, row++, "Business Name:", businessNameField);
        addFormField(settingsForm, gbc, row++, "Business Email:", businessEmailField);
        addFormField(settingsForm, gbc, row++, "Business Phone:", businessPhoneField);
        
        // Save button
        JButton saveButton = createStyledButton("💾 Save Settings", ACCENT_COLOR);
        saveButton.setPreferredSize(new Dimension(200, 45));
        saveButton.addActionListener(e -> {
            try {
                twoWheelerCost = Double.parseDouble(twoWheelerField.getText());
                threeWheelerCost = Double.parseDouble(threeWheelerField.getText());
                fourWheelerCost = Double.parseDouble(fourWheelerField.getText());
                premiumDiscount = Double.parseDouble(discountField.getText());
                
                saveSettings(twoWheelerField.getText(), threeWheelerField.getText(), 
                            fourWheelerField.getText(), discountField.getText(),
                            businessNameField.getText(), businessEmailField.getText(), 
                            businessPhoneField.getText());
                
                JOptionPane.showMessageDialog(this, "Settings saved successfully!", 
                                            "Success", JOptionPane.INFORMATION_MESSAGE);
            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(this, "Please enter valid numbers for costs and discount", 
                                            "Error", JOptionPane.ERROR_MESSAGE);
            }
        });
        
        gbc.gridx = 0;
        gbc.gridy = row++;
        gbc.gridwidth = 2;
        gbc.anchor = GridBagConstraints.CENTER;
        settingsForm.add(Box.createRigidArea(new Dimension(0, 20)), gbc);
        
        gbc.gridy = row;
        settingsForm.add(saveButton, gbc);
        
        panel.add(titleLabel, BorderLayout.NORTH);
        panel.add(settingsForm, BorderLayout.CENTER);
        
        return panel;
    }
    
    // Helper methods for UI components
    private JPanel createStyledPanel() {
        JPanel panel = new JPanel();
        panel.setBackground(CARD_COLOR);
        return panel;
    }
    
    private JLabel createStyledLabel(String text) {
        JLabel label = new JLabel(text);
        label.setFont(new Font("Segoe UI", Font.BOLD, 13));
        label.setForeground(TEXT_COLOR);
        label.setAlignmentX(Component.LEFT_ALIGNMENT);
        return label;
    }
    
    private JTextField createStyledTextField() {
        JTextField field = new JTextField();
        field.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        field.setPreferredSize(new Dimension(250, 35));
        field.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(PRIMARY_COLOR, 1),
                new EmptyBorder(5, 10, 5, 10)
        ));
        field.setMaximumSize(new Dimension(Integer.MAX_VALUE, 35));
        return field;
    }
    
    private JPasswordField createStyledPasswordField() {
        JPasswordField field = new JPasswordField();
        field.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        field.setPreferredSize(new Dimension(250, 35));
        field.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(PRIMARY_COLOR, 1),
                new EmptyBorder(5, 10, 5, 10)
        ));
        field.setMaximumSize(new Dimension(Integer.MAX_VALUE, 35));
        return field;
    }
    
    private JButton createStyledButton(String text, Color color) {
        JButton button = new JButton(text);
        button.setFont(new Font("Segoe UI", Font.BOLD, 14));
        button.setForeground(Color.WHITE);
        button.setBackground(color);
        button.setFocusPainted(false);
        button.setBorderPainted(false);
        button.setPreferredSize(new Dimension(180, 40));
        button.setMaximumSize(new Dimension(Integer.MAX_VALUE, 40));
        button.setAlignmentX(Component.CENTER_ALIGNMENT);
        button.setCursor(new Cursor(Cursor.HAND_CURSOR));
        
        // Hover effect
        button.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) {
                button.setBackground(color.brighter());
            }
            public void mouseExited(MouseEvent e) {
                button.setBackground(color);
            }
        });
        
        return button;
    }
    
    private JButton createSmallButton(String text) {
        JButton button = new JButton(text);
        button.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        button.setPreferredSize(new Dimension(100, 30));
        button.setCursor(new Cursor(Cursor.HAND_CURSOR));
        return button;
    }
    
    private JPanel createStatCard(String title, String value, String icon, Color color) {
        JPanel card = createStyledPanel();
        card.setLayout(new BorderLayout(10, 10));
        card.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(color, 2, true),
                new EmptyBorder(20, 20, 20, 20)
        ));
        
        JLabel iconLabel = new JLabel(icon);
        iconLabel.setFont(new Font("Segoe UI", Font.PLAIN, 40));
        iconLabel.setHorizontalAlignment(SwingConstants.CENTER);
        
        JLabel titleLabel = new JLabel(title);
        titleLabel.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        titleLabel.setForeground(TEXT_COLOR);
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        
        JLabel valueLabel = new JLabel(value);
        valueLabel.setFont(new Font("Segoe UI", Font.BOLD, 24));
        valueLabel.setForeground(color);
        valueLabel.setHorizontalAlignment(SwingConstants.CENTER);
        
        JPanel centerPanel = new JPanel();
        centerPanel.setLayout(new BoxLayout(centerPanel, BoxLayout.Y_AXIS));
        centerPanel.setBackground(CARD_COLOR);
        
        iconLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        valueLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        centerPanel.add(iconLabel);
        centerPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        centerPanel.add(valueLabel);
        centerPanel.add(Box.createRigidArea(new Dimension(0, 5)));
        centerPanel.add(titleLabel);
        
        card.add(centerPanel, BorderLayout.CENTER);
        
        return card;
    }
    
    private void styleTable(JTable table) {
        table.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        table.setRowHeight(30);
        table.setSelectionBackground(PRIMARY_COLOR.brighter());
        table.setSelectionForeground(Color.WHITE);
        table.setGridColor(new Color(200, 200, 200));
        table.setShowGrid(true);
        
        table.getTableHeader().setFont(new Font("Segoe UI", Font.BOLD, 13));
        table.getTableHeader().setBackground(PRIMARY_COLOR);
        table.getTableHeader().setForeground(Color.WHITE);
        table.getTableHeader().setReorderingAllowed(false);
    }
    
    private void addFormField(JPanel panel, GridBagConstraints gbc, int row, String label, Component field) {
        gbc.gridx = 0;
        gbc.gridy = row;
        gbc.gridwidth = 1;
        gbc.anchor = GridBagConstraints.WEST;
        panel.add(createStyledLabel(label), gbc);
        
        gbc.gridx = 1;
        gbc.anchor = GridBagConstraints.EAST;
        panel.add(field, gbc);
    }
    
    // Database operations
    private void loadSettings() {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             Statement stmt = conn.createStatement()) {
            
            ResultSet rs = stmt.executeQuery("SELECT setting_key, setting_value FROM Settings");
            while (rs.next()) {
                String key = rs.getString("setting_key");
                String value = rs.getString("setting_value");
                
                switch (key) {
                    case "two_wheeler_cost" -> twoWheelerCost = Double.parseDouble(value);
                    case "three_wheeler_cost" -> threeWheelerCost = Double.parseDouble(value);
                    case "four_wheeler_cost" -> fourWheelerCost = Double.parseDouble(value);
                    case "premium_discount" -> premiumDiscount = Double.parseDouble(value);
                }
            }
        } catch (SQLException e) {
            System.err.println("Could not load settings: " + e.getMessage());
        }
    }
    
    private String getSettingValue(String key, String defaultValue) {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement("SELECT setting_value FROM Settings WHERE setting_key = ?")) {
            
            stmt.setString(1, key);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getString("setting_value");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return defaultValue;
    }
    
    private void saveSettings(String twoWheeler, String threeWheeler, String fourWheeler, 
                             String discount, String bizName, String bizEmail, String bizPhone) {
        String sql = "INSERT INTO Settings (setting_key, setting_value) VALUES (?, ?) " +
                    "ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, "two_wheeler_cost");
            stmt.setString(2, twoWheeler);
            stmt.executeUpdate();
            
            stmt.setString(1, "three_wheeler_cost");
            stmt.setString(2, threeWheeler);
            stmt.executeUpdate();
            
            stmt.setString(1, "four_wheeler_cost");
            stmt.setString(2, fourWheeler);
            stmt.executeUpdate();
            
            stmt.setString(1, "premium_discount");
            stmt.setString(2, discount);
            stmt.executeUpdate();
            
            stmt.setString(1, "business_name");
            stmt.setString(2, bizName);
            stmt.executeUpdate();
            
            stmt.setString(1, "business_email");
            stmt.setString(2, bizEmail);
            stmt.executeUpdate();
            
            stmt.setString(1, "business_phone");
            stmt.setString(2, bizPhone);
            stmt.executeUpdate();
            
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Failed to save settings: " + e.getMessage(), 
                                        "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private double calculateCost(String vehicleType, boolean isPremium) {
        double baseCost = switch (vehicleType) {
            case "2 Wheeler" -> twoWheelerCost;
            case "3 Wheeler" -> threeWheelerCost;
            case "4 Wheeler" -> fourWheelerCost;
            default -> 0;
        };
        
        return isPremium ? baseCost * (1 - premiumDiscount / 100) : baseCost;
    }
    
    private void handleBookingSubmit(JTextField nameField, JTextField emailField, JTextField phoneField,
                                    JComboBox<String> vehicleCombo, JComboBox<String> serviceCombo,
                                    JTextField dateField, JTextArea notesArea, JLabel costLabel) {
        String name = nameField.getText().trim();
        String email = emailField.getText().trim();
        String phone = phoneField.getText().trim();
        String vehicle = (String) vehicleCombo.getSelectedItem();
        String service = serviceCombo.getSelectedIndex() == 1 ? "Premium" : "Standard";
        String dateStr = dateField.getText().trim();
        String notes = notesArea.getText().trim();
        
        if (name.isEmpty() || email.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Name and Email are required!", 
                                        "Error", JOptionPane.ERROR_MESSAGE);
            return;
        }
        
        boolean isPremium = serviceCombo.getSelectedIndex() == 1;
        double cost = calculateCost(vehicle, isPremium);
        
        String sql = "INSERT INTO GarageServiceBookings (user_id, name, email, phone, wheeler_type, " +
                    "service_type, cost, appointment_date, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            if (currentUserId != null) {
                stmt.setInt(1, currentUserId);
            } else {
                stmt.setNull(1, Types.INTEGER);
            }
            stmt.setString(2, name);
            stmt.setString(3, email);
            stmt.setString(4, phone);
            stmt.setString(5, vehicle);
            stmt.setString(6, service);
            stmt.setDouble(7, cost);
            stmt.setString(8, dateStr);
            stmt.setString(9, notes);
            stmt.setString(10, "Pending");
            
            stmt.executeUpdate();
            
            // Send email
            String emailEnabled = AppConfig.getOrDefault("JAVA_EMAIL_ENABLED", "false");
            if ("true".equalsIgnoreCase(emailEnabled)) {
                try {
                    String emailBody = "🚗 Welcome to Our Garage Services! 🚗\n\n"
                            + "Dear " + name + ",\n\n"
                            + "Great news! Your service booking has been confirmed.\n\n"
                            + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                            + "📋 BOOKING DETAILS\n"
                            + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                            + "Vehicle Type: " + vehicle + "\n"
                            + "Service Package: " + service + (isPremium ? " ⭐" : "") + "\n"
                            + "Appointment: " + dateStr + "\n"
                            + "Total Cost: Rs. " + String.format("%.2f", cost) + "\n"
                            + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
                            + "✨ What's Next?\n"
                            + "• Our team will contact you shortly to confirm your appointment\n"
                            + "• Please bring your vehicle at the scheduled time\n"
                            + "• Our expert technicians will take care of everything!\n\n"
                            + "💡 Need to reschedule or have questions?\n"
                            + "Feel free to reach out to us anytime.\n\n"
                            + "Thank you for choosing our services! We look forward to serving you.\n\n"
                            + "Best regards,\n"
                            + "Your Garage Services Team\n"
                            + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
                    
                    EmailService.sendEmail(email, "🎉 Your Garage Service Booking is Confirmed!", emailBody);
                    JOptionPane.showMessageDialog(this, "Booking successful! Confirmation email sent.", 
                                                "Success", JOptionPane.INFORMATION_MESSAGE);
                } catch (Exception emailError) {
                    JOptionPane.showMessageDialog(this, 
                            "Booking saved but email failed: " + emailError.getMessage(), 
                            "Warning", JOptionPane.WARNING_MESSAGE);
                }
            } else {
                JOptionPane.showMessageDialog(this, "Booking created successfully!", 
                                            "Success", JOptionPane.INFORMATION_MESSAGE);
            }
            
            // Clear form
            nameField.setText("");
            emailField.setText("");
            phoneField.setText("");
            notesArea.setText("");
            
            // Refresh dashboard if on that tab
            if (tabbedPane.getSelectedIndex() == 0) {
                dashboardPanel = createDashboardPanel();
                tabbedPane.setComponentAt(0, dashboardPanel);
            }
            
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Booking failed: " + e.getMessage(), 
                                        "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private int[] getStatistics() {
        int[] stats = new int[4]; // total, pending, completed, revenue
        
        String userFilter = currentUserId != null ? " WHERE user_id = " + currentUserId : "";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             Statement stmt = conn.createStatement()) {
            
            ResultSet rs = stmt.executeQuery("SELECT COUNT(*) as total, " +
                    "SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending, " +
                    "SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed, " +
                    "SUM(cost) as revenue FROM GarageServiceBookings" + userFilter);
            
            if (rs.next()) {
                stats[0] = rs.getInt("total");
                stats[1] = rs.getInt("pending");
                stats[2] = rs.getInt("completed");
                stats[3] = rs.getInt("revenue");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return stats;
    }
    
    private void loadRecentBookings(DefaultTableModel model, int limit) {
        model.setRowCount(0);
        
        String userFilter = currentUserId != null ? " WHERE user_id = " + currentUserId : "";
        
        String sql = "SELECT id, name, wheeler_type, appointment_date, status, cost " +
                    "FROM GarageServiceBookings" + userFilter + 
                    " ORDER BY booking_date DESC LIMIT ?";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, limit);
            ResultSet rs = stmt.executeQuery();
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            
            while (rs.next()) {
                Object[] row = {
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getString("wheeler_type"),
                    rs.getString("appointment_date"),
                    rs.getString("status"),
                    String.format("Rs. %.2f", rs.getDouble("cost"))
                };
                model.addRow(row);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    
    private void loadAllBookings(DefaultTableModel model) {
        model.setRowCount(0);
        
        String userFilter = currentUserId != null ? " WHERE user_id = " + currentUserId : "";
        
        String sql = "SELECT id, name, email, phone, wheeler_type, service_type, " +
                    "appointment_date, status, cost FROM GarageServiceBookings" + userFilter + 
                    " ORDER BY booking_date DESC";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Object[] row = {
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getString("email"),
                    rs.getString("phone"),
                    rs.getString("wheeler_type"),
                    rs.getString("service_type"),
                    rs.getString("appointment_date"),
                    rs.getString("status"),
                    String.format("Rs. %.2f", rs.getDouble("cost"))
                };
                model.addRow(row);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    
    private void searchBookings(DefaultTableModel model, String searchTerm) {
        model.setRowCount(0);
        
        String userFilter = currentUserId != null ? " AND user_id = " + currentUserId : "";
        
        String sql = "SELECT id, name, email, phone, wheeler_type, service_type, " +
                    "appointment_date, status, cost FROM GarageServiceBookings " +
                    "WHERE (name LIKE ? OR email LIKE ? OR phone LIKE ? OR wheeler_type LIKE ?)" + 
                    userFilter + " ORDER BY booking_date DESC";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            String pattern = "%" + searchTerm + "%";
            stmt.setString(1, pattern);
            stmt.setString(2, pattern);
            stmt.setString(3, pattern);
            stmt.setString(4, pattern);
            
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                Object[] row = {
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getString("email"),
                    rs.getString("phone"),
                    rs.getString("wheeler_type"),
                    rs.getString("service_type"),
                    rs.getString("appointment_date"),
                    rs.getString("status"),
                    String.format("Rs. %.2f", rs.getDouble("cost"))
                };
                model.addRow(row);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    
    private void showBookingDetails(DefaultTableModel model, int row) {
        JDialog dialog = new JDialog(this, "Booking Details", true);
        dialog.setSize(500, 600);
        dialog.setLocationRelativeTo(this);
        
        int bookingId = (int) model.getValueAt(row, 0);
        
        String sql = "SELECT * FROM GarageServiceBookings WHERE id = ?";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, bookingId);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                JPanel panel = new JPanel();
                panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
                panel.setBorder(new EmptyBorder(20, 20, 20, 20));
                panel.setBackground(Color.WHITE);
                
                addDetailRow(panel, "Booking ID:", String.valueOf(rs.getInt("id")));
                addDetailRow(panel, "Customer Name:", rs.getString("name"));
                addDetailRow(panel, "Email:", rs.getString("email"));
                addDetailRow(panel, "Phone:", rs.getString("phone"));
                addDetailRow(panel, "Vehicle Type:", rs.getString("wheeler_type"));
                addDetailRow(panel, "Service Type:", rs.getString("service_type"));
                addDetailRow(panel, "Appointment Date:", rs.getString("appointment_date"));
                addDetailRow(panel, "Status:", rs.getString("status"));
                addDetailRow(panel, "Cost:", String.format("Rs. %.2f", rs.getDouble("cost")));
                addDetailRow(panel, "Booking Date:", rs.getString("booking_date"));
                addDetailRow(panel, "Notes:", rs.getString("notes"));
                
                JScrollPane scrollPane = new JScrollPane(panel);
                scrollPane.setBorder(null);
                dialog.add(scrollPane);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        dialog.setVisible(true);
    }
    
    private void addDetailRow(JPanel panel, String label, String value) {
        JPanel row = new JPanel(new BorderLayout(10, 10));
        row.setBackground(Color.WHITE);
        row.setBorder(new EmptyBorder(5, 0, 5, 0));
        
        JLabel labelComp = new JLabel(label);
        labelComp.setFont(new Font("Segoe UI", Font.BOLD, 13));
        labelComp.setForeground(TEXT_COLOR);
        
        JLabel valueComp = new JLabel(value != null ? value : "N/A");
        valueComp.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        
        row.add(labelComp, BorderLayout.WEST);
        row.add(valueComp, BorderLayout.CENTER);
        
        panel.add(row);
    }
    
    private void updateBookingStatus(DefaultTableModel model, int row) {
        int bookingId = (int) model.getValueAt(row, 0);
        
        String[] statuses = {"Pending", "Confirmed", "In Progress", "Completed", "Cancelled"};
        String newStatus = (String) JOptionPane.showInputDialog(this, 
                "Select new status:", 
                "Update Status", 
                JOptionPane.QUESTION_MESSAGE, 
                null, 
                statuses, 
                statuses[0]);
        
        if (newStatus != null) {
            String sql = "UPDATE GarageServiceBookings SET status = ? WHERE id = ?";
            
            try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                
                stmt.setString(1, newStatus);
                stmt.setInt(2, bookingId);
                stmt.executeUpdate();
                
                model.setValueAt(newStatus, row, 7);
                
                JOptionPane.showMessageDialog(this, "Status updated successfully!", 
                                            "Success", JOptionPane.INFORMATION_MESSAGE);
            } catch (SQLException e) {
                JOptionPane.showMessageDialog(this, "Update failed: " + e.getMessage(), 
                                            "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }
    
    private void deleteBooking(int bookingId) {
        String sql = "DELETE FROM GarageServiceBookings WHERE id = ?";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, bookingId);
            stmt.executeUpdate();
            
            JOptionPane.showMessageDialog(this, "Booking deleted successfully!", 
                                        "Success", JOptionPane.INFORMATION_MESSAGE);
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Delete failed: " + e.getMessage(), 
                                        "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            String dbUrl = AppConfig.get("JAVA_DB_URL");
            String dbUser = AppConfig.get("JAVA_DB_USER");
            String dbPassword = AppConfig.getOrDefault("JAVA_DB_PASSWORD", "");
            
            if (dbUrl == null || dbUser == null) {
                JOptionPane.showMessageDialog(null, 
                        "Database configuration missing! Check .env file", 
                        "Error", JOptionPane.ERROR_MESSAGE);
                return;
            }
            
            new ModernGarageApp(dbUrl, dbUser, dbPassword);
        });
    }
}
