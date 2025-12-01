# Metadata Structure Design

## Overview
This document outlines the proposed metadata structure for the Open Data Integration Platform (LDOP), inspired by Metabase's data model. The goal is to enrich the raw database schema with semantic information to enable better data discovery, visualization, and governance.

## Core Concepts

### 1. Table Metadata
Represents a table or view in the source system.

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Physical table name in the database. |
| `displayName` | String | User-friendly name for display (e.g., "Customer Orders"). |
| `description` | String | Contextual description of the table's contents. |
| `visibility` | Enum | Controls where the table appears. <br> - `VISIBLE`: Default, shown everywhere. <br> - `HIDDEN`: Hidden from lists but queryable. <br> - `TECHNICAL`: Internal use only. |
| `columns` | List | List of column definitions. |
| `lastSyncedAt` | DateTime | Timestamp of the last schema sync. |

### 2. Column Metadata
Represents a column within a table.

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Physical column name. |
| `displayName` | String | User-friendly name (e.g., "Order Total"). |
| `dataType` | String | Physical data type (e.g., `VARCHAR`, `INTEGER`, `TIMESTAMP`). |
| `semanticType` | Enum | Semantic meaning of the data. See [Semantic Types](#semantic-types). |
| `description` | String | Description of the column. |
| `visibility` | Enum | Controls column visibility. <br> - `EVERYWHERE`: Default. <br> - `DETAIL_ONLY`: Hide in table views, show in detail views. <br> - `HIDDEN`: Hide from UI. |
| `isPrimaryKey` | Boolean | Whether this column is part of the primary key. |
| `isForeignKey` | Boolean | Whether this column is a foreign key. |
| `foreignKeyTarget`| String | Target of the FK (e.g., `other_table.id`). |
| `formatting` | Map | Display formatting rules (e.g., currency symbol, date pattern). |

### 3. Semantic Types
Semantic types help the frontend choose the right visualization and filter widgets.

- **Basic**: `TEXT`, `NUMBER`, `BOOLEAN`
- **Time**: `DATE`, `DATETIME`, `TIME`, `TIMESTAMP`
- **Financial**: `CURRENCY`
- **Geography**: `CITY`, `COUNTRY`, `LATITUDE`, `LONGITUDE`
- **Identity**: `ID` (Entity Key), `UUID`
- **Web**: `URL`, `IMAGE_URL`, `EMAIL`
- **Categorical**: `CATEGORY` (Low cardinality, suitable for dropdowns)
- **Status**: `STATUS` (e.g., Active/Inactive)

## JSON Schema Example

```json
{
  "name": "orders",
  "displayName": "Customer Orders",
  "description": "All orders placed by customers including status and totals.",
  "visibility": "VISIBLE",
  "columns": [
    {
      "name": "id",
      "displayName": "Order ID",
      "dataType": "INTEGER",
      "semanticType": "ID",
      "isPrimaryKey": true,
      "visibility": "EVERYWHERE"
    },
    {
      "name": "total_amount",
      "displayName": "Total",
      "dataType": "DECIMAL",
      "semanticType": "CURRENCY",
      "formatting": {
        "currency": "USD"
      }
    },
    {
      "name": "status",
      "displayName": "Order Status",
      "dataType": "VARCHAR",
      "semanticType": "STATUS",
      "visibility": "EVERYWHERE"
    },
    {
      "name": "created_at",
      "displayName": "Placed At",
      "dataType": "TIMESTAMP",
      "semanticType": "DATETIME",
      "visibility": "DETAIL_ONLY"
    }
  ]
}
```

## Implementation Strategy

1.  **Backend DTOs**: Update `TableMetadata` and `ColumnMetadata` classes in `com.example.ldop.dto`.
2.  **Entity Storage**: These DTOs are already stored as JSONB in `Connector.registeredTables`. No schema change needed for `Connector` entity, just the JSON structure.
3.  **API Updates**: Ensure the connector registration and details APIs populate and return these new fields.
4.  **Frontend**: Update the UI to allow editing these fields (future task).
