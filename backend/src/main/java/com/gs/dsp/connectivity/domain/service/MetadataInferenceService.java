package com.gs.dsp.connectivity.domain.service;

import com.gs.dsp.connectivity.infrastructure.primary.dto.SemanticType;

import java.util.HashMap;
import java.util.Map;

/**
 * Domain Service for intelligent metadata inference from database schema information.
 * Automatically infers semantic types, generates display names, and suggests formatting.
 * 
 * NOTE: This is a pure Domain Service (framework-agnostic). It is registered as a
 * Spring bean via ConnectivityDomainConfig in the infrastructure layer.
 */
public class MetadataInferenceService {

    /**
     * Infers the semantic type of a column based on its name and database data type.
     * 
     * Priority order:
     * 1. Database type exact match (uuid, boolean, timestamp, etc.)
     * 2. Column name pattern matching (email, url, price, etc.)
     * 3. Generic type fallback (varchar → TEXT, int → NUMBER)
     * 
     * @param columnName The name of the column (e.g., "user_email", "created_at")
     * @param dataType The database data type (e.g., "uuid", "character varying", "timestamp")
     * @return The inferred semantic type
     */
    public SemanticType inferSemanticType(String columnName, String dataType) {
        if (columnName == null || dataType == null) {
            return SemanticType.UNKNOWN;
        }

        String lowerColumnName = columnName.toLowerCase();
        String lowerDataType = dataType.toLowerCase();

        // Priority 1: Database type exact patterns
        if (lowerDataType.contains("uuid")) {
            return SemanticType.UUID;
        }
        if (lowerDataType.contains("boolean") || lowerDataType.equals("bool")) {
            return SemanticType.BOOLEAN;
        }
        if (lowerDataType.contains("timestamp")) {
            return SemanticType.TIMESTAMP;
        }
        
        // Check DATE/DATETIME/TIME datatype BEFORE column name patterns
        if (lowerDataType.contains("datetime")) {
            return SemanticType.DATETIME;
        }
        if (lowerDataType.contains("date") && !lowerDataType.contains("time")) {
            return SemanticType.DATE;
        }
        if (lowerDataType.equals("time") || (lowerDataType.contains("time") && !lowerDataType.contains("stamp") && !lowerDataType.contains("date"))) {
            return SemanticType.TIME;
        }

        // Priority 2: Column name patterns (more specific first)
        if (lowerColumnName.matches(".*email.*")) {
            return SemanticType.EMAIL;
        }
        // Check IMAGE patterns BEFORE URL patterns (more specific)
        if (lowerColumnName.matches(".*(image|img|photo|picture).*")) {
            return SemanticType.IMAGE_URL;
        }
        if (lowerColumnName.matches(".*(url|link).*")) {
            return SemanticType.URL;
        }
        if (lowerColumnName.matches(".*(price|amount|cost|total|subtotal|fee).*")) {
            return SemanticType.CURRENCY;
        }
        if (lowerColumnName.matches(".*(status|state).*")) {
            return SemanticType.STATUS;
        }
        if (lowerColumnName.matches(".*(category|type|kind).*")) {
            return SemanticType.CATEGORY;
        }
        
        // Date/time column name patterns (after datatype checks)
        // Note: _date pattern here will only match if datatype is NOT 'date' (checked earlier)
        if (lowerColumnName.matches(".*(_at|_date|created|updated|modified|deleted)$")) {
            return SemanticType.DATETIME;
        }
        
        // Geography patterns
        if (lowerColumnName.matches(".*(city).*")) {
            return SemanticType.CITY;
        }
        if (lowerColumnName.matches(".*(country|nation).*")) {
            return SemanticType.COUNTRY;
        }
        if (lowerColumnName.matches(".*(latitude|lat)$")) {
            return SemanticType.LATITUDE;
        }
        if (lowerColumnName.matches(".*(longitude|lon|lng)$")) {
            return SemanticType.LONGITUDE;
        }

        // Priority 3: Generic type fallback based on database type
        if (lowerDataType.contains("char") || lowerDataType.contains("text") || lowerDataType.contains("string")) {
            return SemanticType.TEXT;
        }
        if (lowerDataType.contains("int") || lowerDataType.contains("serial") || 
            lowerDataType.contains("numeric") || lowerDataType.contains("decimal") || 
            lowerDataType.contains("float") || lowerDataType.contains("double")) {
            return SemanticType.NUMBER;
        }

        return SemanticType.UNKNOWN;
    }

    /**
     * Generates a user-friendly display name from a technical database name.
     * Converts snake_case, camelCase, or SCREAMING_SNAKE_CASE to Title Case.
     * 
     * Examples:
     * - "user_email" → "User Email"
     * - "createdAt" → "Created At"
     * - "TOTAL_AMOUNT" → "Total Amount"
     * 
     * @param technicalName The technical name from the database
     * @return A user-friendly display name
     */
    public String generateDisplayName(String technicalName) {
        if (technicalName == null || technicalName.isEmpty()) {
            return technicalName;
        }

        // Handle snake_case or SCREAMING_SNAKE_CASE
        String result = technicalName.replace("_", " ");

        // Handle camelCase by inserting spaces before capitals
        result = result.replaceAll("([a-z])([A-Z])", "$1 $2");

        // Convert to Title Case
        String[] words = result.split("\\s+");
        StringBuilder titleCase = new StringBuilder();
        
        for (String word : words) {
            if (word.length() > 0) {
                if (titleCase.length() > 0) {
                    titleCase.append(" ");
                }
                titleCase.append(Character.toUpperCase(word.charAt(0)));
                if (word.length() > 1) {
                    titleCase.append(word.substring(1).toLowerCase());
                }
            }
        }

        return titleCase.toString();
    }

    /**
     * Infers default formatting options based on semantic type.
     * 
     * @param semanticType The semantic type of the column
     * @return A map of formatting options (e.g., {"currency": "USD"})
     */
    public Map<String, Object> inferFormatting(SemanticType semanticType) {
        Map<String, Object> formatting = new HashMap<>();

        if (semanticType == null) {
            return formatting;
        }

        switch (semanticType) {
            case CURRENCY:
                formatting.put("currency", "USD");
                formatting.put("decimals", 2);
                break;
            case DATE:
                formatting.put("format", "YYYY-MM-DD");
                break;
            case DATETIME:
            case TIMESTAMP:
                formatting.put("format", "YYYY-MM-DD HH:mm:ss");
                formatting.put("timezone", "UTC");
                break;
            case TIME:
                formatting.put("format", "HH:mm:ss");
                break;
            case NUMBER:
                formatting.put("decimals", 0);
                break;
            default:
                // No special formatting needed
                break;
        }

        return formatting;
    }
}
