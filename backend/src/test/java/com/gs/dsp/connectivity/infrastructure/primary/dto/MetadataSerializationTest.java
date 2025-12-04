package com.gs.dsp.connectivity.infrastructure.primary.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class MetadataSerializationTest {

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Test
    public void testTableMetadataSerialization() throws Exception {
        ColumnMetadata column = new ColumnMetadata();
        column.setName("id");
        column.setDisplayName("ID");
        column.setDataType("INTEGER");
        column.setSemanticType(SemanticType.ID);
        column.setVisibility(MetadataVisibility.EVERYWHERE);
        column.setPrimaryKey(true);
        column.setFormatting(Map.of("foo", "bar"));

        TableMetadata table = new TableMetadata();
        table.setName("users");
        table.setDisplayName("Users Table");
        table.setDescription("Contains user data");
        table.setVisibility(MetadataVisibility.VISIBLE);
        table.setLastSyncedAt(LocalDateTime.now());
        table.setColumns(Collections.singletonList(column));

        String json = objectMapper.writeValueAsString(table);
        assertNotNull(json);
        assertTrue(json.contains("Users Table"));
        assertTrue(json.contains("VISIBLE"));
        assertTrue(json.contains("ID"));

        TableMetadata deserialized = objectMapper.readValue(json, TableMetadata.class);
        assertEquals(table.getName(), deserialized.getName());
        assertEquals(table.getDisplayName(), deserialized.getDisplayName());
        assertEquals(table.getVisibility(), deserialized.getVisibility());
        assertEquals(1, deserialized.getColumns().size());
        
        ColumnMetadata deserializedColumn = deserialized.getColumns().get(0);
        assertEquals(column.getName(), deserializedColumn.getName());
        assertEquals(column.getSemanticType(), deserializedColumn.getSemanticType());
        assertEquals("bar", deserializedColumn.getFormatting().get("foo"));
    }
}
