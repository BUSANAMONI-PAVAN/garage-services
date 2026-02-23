package com.garage;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class AppConfig {

    private static final Map<String, String> DOT_ENV = loadDotEnv();

    private AppConfig() {
    }

    public static String get(String key) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            value = DOT_ENV.get(key);
        }
        return value == null ? "" : value.trim();
    }

    public static String getOrDefault(String key, String defaultValue) {
        String value = get(key);
        return value.isBlank() ? defaultValue : value;
    }

    public static List<String> missing(String... keys) {
        List<String> missing = new ArrayList<>();
        for (String key : keys) {
            if (get(key).isBlank()) {
                missing.add(key);
            }
        }
        return missing;
    }

    private static Map<String, String> loadDotEnv() {
        Path envPath = Paths.get(".env");
        if (!Files.exists(envPath)) {
            return Collections.emptyMap();
        }

        Map<String, String> values = new HashMap<>();
        try {
            for (String rawLine : Files.readAllLines(envPath, StandardCharsets.UTF_8)) {
                String line = rawLine.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }

                int separatorIndex = line.indexOf('=');
                if (separatorIndex <= 0) {
                    continue;
                }

                String key = line.substring(0, separatorIndex).trim();
                String value = line.substring(separatorIndex + 1).trim();
                if (
                        (value.startsWith("\"") && value.endsWith("\"")) ||
                        (value.startsWith("'") && value.endsWith("'"))
                ) {
                    value = value.substring(1, value.length() - 1);
                }

                if (!key.isEmpty() && !values.containsKey(key)) {
                    values.put(key, value);
                }
            }
        } catch (IOException error) {
            System.err.println("Unable to read .env file: " + error.getMessage());
        }

        return values;
    }
}
