package com.gs.dsp.connectivity.domain.service;

import com.gs.dsp.connectivity.infrastructure.primary.dto.SemanticType;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for MetadataInferenceService
 */
public class MetadataInferenceServiceTest {

    private final MetadataInferenceService service = new MetadataInferenceService();

    // === Semantic Type Inference Tests ===

    @Test
    void testInferSemanticType_UUID() {
        assertThat(service.inferSemanticType("id", "uuid")).isEqualTo(SemanticType.UUID);
        assertThat(service.inferSemanticType("user_id", "uuid")).isEqualTo(SemanticType.UUID);
    }

    @Test
    void testInferSemanticType_Email() {
        assertThat(service.inferSemanticType("user_email", "character varying")).isEqualTo(SemanticType.EMAIL);
        assertThat(service.inferSemanticType("email", "varchar")).isEqualTo(SemanticType.EMAIL);
        assertThat(service.inferSemanticType("contact_email", "text")).isEqualTo(SemanticType.EMAIL);
    }

    @Test
    void testInferSemanticType_URL() {
        assertThat(service.inferSemanticType("website_url", "varchar")).isEqualTo(SemanticType.URL);
        assertThat(service.inferSemanticType("link", "text")).isEqualTo(SemanticType.URL);
        assertThat(service.inferSemanticType("profile_link", "varchar")).isEqualTo(SemanticType.URL);
    }

    @Test
    void testInferSemanticType_ImageURL() {
        assertThat(service.inferSemanticType("profile_image", "varchar")).isEqualTo(SemanticType.IMAGE_URL);
        assertThat(service.inferSemanticType("photo_url", "text")).isEqualTo(SemanticType.IMAGE_URL);
        assertThat(service.inferSemanticType("picture", "varchar")).isEqualTo(SemanticType.IMAGE_URL);
    }

    @Test
    void testInferSemanticType_Currency() {
        assertThat(service.inferSemanticType("price", "decimal")).isEqualTo(SemanticType.CURRENCY);
        assertThat(service.inferSemanticType("total_amount", "numeric")).isEqualTo(SemanticType.CURRENCY);
        assertThat(service.inferSemanticType("cost", "decimal")).isEqualTo(SemanticType.CURRENCY);
        assertThat(service.inferSemanticType("subtotal", "numeric")).isEqualTo(SemanticType.CURRENCY);
    }

    @Test
    void testInferSemanticType_Status() {
        assertThat(service.inferSemanticType("order_status", "varchar")).isEqualTo(SemanticType.STATUS);
        assertThat(service.inferSemanticType("state", "varchar")).isEqualTo(SemanticType.STATUS);
    }

    @Test
    void testInferSemanticType_Category() {
        assertThat(service.inferSemanticType("category", "varchar")).isEqualTo(SemanticType.CATEGORY);
        assertThat(service.inferSemanticType("product_type", "varchar")).isEqualTo(SemanticType.CATEGORY);
    }

    @Test
    void testInferSemanticType_DateTime() {
        assertThat(service.inferSemanticType("created_at", "timestamp")).isEqualTo(SemanticType.TIMESTAMP);
        assertThat(service.inferSemanticType("updated_at", "timestamp without time zone")).isEqualTo(SemanticType.TIMESTAMP);
        assertThat(service.inferSemanticType("deleted_at", "datetime")).isEqualTo(SemanticType.DATETIME);
        assertThat(service.inferSemanticType("last_login_date", "varchar")).isEqualTo(SemanticType.DATETIME);
    }

    @Test
    void testInferSemanticType_Date() {
        assertThat(service.inferSemanticType("birth_date", "date")).isEqualTo(SemanticType.DATE);
    }

    @Test
    void testInferSemanticType_Time() {
        assertThat(service.inferSemanticType("start_time", "time")).isEqualTo(SemanticType.TIME);
    }

    @Test
    void testInferSemanticType_Boolean() {
        assertThat(service.inferSemanticType("is_active", "boolean")).isEqualTo(SemanticType.BOOLEAN);
        assertThat(service.inferSemanticType("enabled", "bool")).isEqualTo(SemanticType.BOOLEAN);
    }

    @Test
    void testInferSemanticType_Geography() {
        assertThat(service.inferSemanticType("city", "varchar")).isEqualTo(SemanticType.CITY);
        assertThat(service.inferSemanticType("home_city", "text")).isEqualTo(SemanticType.CITY);
        assertThat(service.inferSemanticType("country", "varchar")).isEqualTo(SemanticType.COUNTRY);
        assertThat(service.inferSemanticType("latitude", "decimal")).isEqualTo(SemanticType.LATITUDE);
        assertThat(service.inferSemanticType("lat", "float")).isEqualTo(SemanticType.LATITUDE);
        assertThat(service.inferSemanticType("longitude", "decimal")).isEqualTo(SemanticType.LONGITUDE);
        assertThat(service.inferSemanticType("lng", "float")).isEqualTo(SemanticType.LONGITUDE);
    }

    @Test
    void testInferSemanticType_GenericText() {
        assertThat(service.inferSemanticType("description", "varchar")).isEqualTo(SemanticType.TEXT);
        assertThat(service.inferSemanticType("notes", "text")).isEqualTo(SemanticType.TEXT);
    }

    @Test
    void testInferSemanticType_GenericNumber() {
        assertThat(service.inferSemanticType("quantity", "integer")).isEqualTo(SemanticType.NUMBER);
        assertThat(service.inferSemanticType("count", "int")).isEqualTo(SemanticType.NUMBER);
    }

    @Test
    void testInferSemanticType_Unknown() {
        assertThat(service.inferSemanticType(null, "varchar")).isEqualTo(SemanticType.UNKNOWN);
        assertThat(service.inferSemanticType("column", null)).isEqualTo(SemanticType.UNKNOWN);
    }

    // === Display Name Generation Tests ===

    @Test
    void testGenerateDisplayName_SnakeCase() {
        assertThat(service.generateDisplayName("user_email")).isEqualTo("User Email");
        assertThat(service.generateDisplayName("created_at")).isEqualTo("Created At");
        assertThat(service.generateDisplayName("total_amount")).isEqualTo("Total Amount");
    }

    @Test
    void testGenerateDisplayName_CamelCase() {
        assertThat(service.generateDisplayName("userId")).isEqualTo("User Id");
        assertThat(service.generateDisplayName("createdAt")).isEqualTo("Created At");
        assertThat(service.generateDisplayName("totalAmount")).isEqualTo("Total Amount");
    }

    @Test
    void testGenerateDisplayName_ScreamingSnakeCase() {
        assertThat(service.generateDisplayName("USER_EMAIL")).isEqualTo("User Email");
        assertThat(service.generateDisplayName("CREATED_AT")).isEqualTo("Created At");
    }

    @Test
    void testGenerateDisplayName_SingleWord() {
        assertThat(service.generateDisplayName("id")).isEqualTo("Id");
        assertThat(service.generateDisplayName("name")).isEqualTo("Name");
    }

    @Test
    void testGenerateDisplayName_Empty() {
        assertThat(service.generateDisplayName("")).isEqualTo("");
        assertThat(service.generateDisplayName(null)).isNull();
    }

    // === Formatting Inference Tests ===

    @Test
    void testInferFormatting_Currency() {
        Map<String, Object> formatting = service.inferFormatting(SemanticType.CURRENCY);
        assertThat(formatting).containsEntry("currency", "USD");
        assertThat(formatting).containsEntry("decimals", 2);
    }

    @Test
    void testInferFormatting_Date() {
        Map<String, Object> formatting = service.inferFormatting(SemanticType.DATE);
        assertThat(formatting).containsEntry("format", "YYYY-MM-DD");
    }

    @Test
    void testInferFormatting_DateTime() {
        Map<String, Object> formatting = service.inferFormatting(SemanticType.DATETIME);
        assertThat(formatting).containsEntry("format", "YYYY-MM-DD HH:mm:ss");
        assertThat(formatting).containsEntry("timezone", "UTC");
    }

    @Test
    void testInferFormatting_Timestamp() {
        Map<String, Object> formatting = service.inferFormatting(SemanticType.TIMESTAMP);
        assertThat(formatting).containsEntry("format", "YYYY-MM-DD HH:mm:ss");
        assertThat(formatting).containsEntry("timezone", "UTC");
    }

    @Test
    void testInferFormatting_Time() {
        Map<String, Object> formatting = service.inferFormatting(SemanticType.TIME);
        assertThat(formatting).containsEntry("format", "HH:mm:ss");
    }

    @Test
    void testInferFormatting_Number() {
        Map<String, Object> formatting = service.inferFormatting(SemanticType.NUMBER);
        assertThat(formatting).containsEntry("decimals", 0);
    }

    @Test
    void testInferFormatting_NoFormatting() {
        Map<String, Object> formatting = service.inferFormatting(SemanticType.TEXT);
        assertThat(formatting).isEmpty();
        
        formatting = service.inferFormatting(null);
        assertThat(formatting).isEmpty();
    }
}
