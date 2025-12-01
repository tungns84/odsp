# API Cheatsheet - Open Data Integration Platform

**Base URL:** `http://localhost:8080`
**Required Header:** `X-Tenant-ID: <your-tenant-id>`

## 1. Connectors

### List All Connectors
```bash
curl -X GET "http://localhost:8080/api/v1/connectors" \
     -H "X-Tenant-ID: tenant-1"
```

### Create a Connector (PostgreSQL Example)
```bash
curl -X POST "http://localhost:8080/api/v1/connectors" \
     -H "X-Tenant-ID: tenant-1" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "My Postgres DB",
           "type": "DATABASE",
           "config": {
             "host": "localhost",
             "port": 5432,
             "databaseName": "mydb",
             "username": "myuser",
             "password": "mypassword",
             "schema": "public"
           },
           "registeredTables": ["users", "orders"],
           "isActive": true
         }'
```

### Test Connection & Fetch Tables
```bash
curl -X POST "http://localhost:8080/api/v1/connectors/test-connection" \
     -H "X-Tenant-ID: tenant-1" \
     -H "Content-Type: application/json" \
     -d '{
           "host": "localhost",
           "port": 5432,
           "databaseName": "mydb",
           "username": "myuser",
           "password": "mypassword",
           "schema": "public"
         }'
```
*Returns `200 OK` with a JSON list of **enriched** TableMetadata if successful.*

**Response includes auto-populated metadata:**
- `displayName`: User-friendly table/column names
- `semanticType`: Inferred data types (UUID, EMAIL, CURRENCY, DATE, etc.)
- `visibility`: Display visibility settings
- `isPrimaryKey` / `isForeignKey`: Relationship information
- `formatting`: Suggested formatting options

```json
[
  {
    "name": "users",
    "displayName": "Users",
    "visibility": "VISIBLE",
    "lastSyncedAt": "2025-11-25T11:42:00",
    "columns": [
      {
        "name": "id",
        "displayName": "Id",
        "dataType": "uuid",
        "semanticType": "UUID",
        "visibility": "EVERYWHERE",
        "isPrimaryKey": true,
        "isForeignKey": false
      },
      {
        "name": "user_email",
        "displayName": "User Email",
        "dataType": "character varying",
        "semanticType": "EMAIL",
        "visibility": "EVERYWHERE",
        "isPrimaryKey": false,
        "isForeignKey": false
      },
      {
        "name": "total_amount",
        "displayName": "Total Amount",
        "dataType": "decimal",
        "semanticType": "CURRENCY",
        "visibility": "EVERYWHERE",
        "isPrimaryKey": false,
        "isForeignKey": false,
        "formatting": {
          "currency": "USD",
          "decimals": 2
        }
      },
      {
        "name": "created_at",
        "displayName": "Created At",
        "dataType": "timestamp without time zone",
        "semanticType": "TIMESTAMP",
        "visibility": "EVERYWHERE",
        "isPrimaryKey": false,
        "isForeignKey": false,
        "formatting": {
          "format": "YYYY-MM-DD HH:mm:ss",
          "timezone": "UTC"
        }
      }
    ]
  }
]
```

### Supported Semantic Types
The system automatically infers **20+ semantic types**:
- **Identity**: `UUID`, `ID`
- **Contact**: `EMAIL`, `URL`, `IMAGE_URL`
- **Financial**: `CURRENCY`
- **Time**: `DATE`, `DATETIME`, `TIMESTAMP`, `TIME`
- **Geography**: `CITY`, `COUNTRY`, `LATITUDE`, `LONGITUDE`
- **Categorical**: `STATUS`, `CATEGORY`
- **Basic**: `TEXT`, `NUMBER`, `BOOLEAN`

### Get Connector by ID
```bash
curl -X GET "http://localhost:8080/api/v1/connectors/<connector-uuid>" \
     -H "X-Tenant-ID: tenant-1"
```

### Delete Connector
```bash
curl -X DELETE "http://localhost:8080/api/v1/connectors/<connector-uuid>" \
     -H "X-Tenant-ID: tenant-1"
```

### Approve/Reject Connector
**Note:** New connectors are created with status `INIT` and must be `APPROVED` before use.

```bash
curl -X PUT "http://localhost:8080/api/v1/connectors/<connector-uuid>/approval" \
     -H "X-Tenant-ID: tenant-1" \
     -H "Content-Type: application/json" \
     -d '{
           "status": "APPROVED"
         }'
```
*Allowed status values: `APPROVED`, `REJECTED`*

### Explore Connector Schema
```bash
# List Registered Tables (from Connector config)
# Note: This returns the list stored in the connector entity
curl -X GET "http://localhost:8080/api/v1/connectors/<connector-uuid>" \
     -H "X-Tenant-ID: tenant-1"

# Fetch Live Tables (from Database)
curl -X GET "http://localhost:8080/api/v1/connectors/<connector-uuid>/tables" \
     -H "X-Tenant-ID: tenant-1"
```

## 2. Data Endpoints (Dynamic Data)

*Note: Data Endpoints must be created in the DB first (via SQL or a future API). This cheatsheet assumes you have an endpoint ID.*

### Test/Preview Query (Top 10)
```bash
curl -X POST "http://localhost:8080/api/v1/data-endpoints/test" \
     -H "X-Tenant-ID: tenant-1" \
     -H "Content-Type: application/json" \
     -d '{
           "connectorId": "<connector-uuid>",
           "sourceType": "SQL",
           "sourceContent": "SELECT * FROM users"
         }'
```
*Returns the first 10 rows of the result.*
```bash
curl -X POST "http://localhost:8080/api/v1/data-endpoints" \
     -H "X-Tenant-ID: tenant-1" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "High Value Users",
           "connectorId": "<connector-uuid>",
           "sourceType": "SQL", 
           "sourceContent": "SELECT * FROM users WHERE spending > 1000",
           "description": "Users with high spending"
         }'
```
*`sourceType` can be `TABLE` (sourceContent = table name) or `SQL` (sourceContent = raw SQL).*

### Query Data
```bash
curl -X GET "http://localhost:8080/api/v1/data/<data-endpoint-uuid>?page=0&size=10" \
     -H "X-Tenant-ID: tenant-1"
```

### Response Format
```json
{
  "meta": {
    "page": 0,
    "size": 10
  },
  "data": [
    {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com"
    }
  ]
}
```

## 3. Troubleshooting

| Status Code | Meaning | Possible Cause |
| :--- | :--- | :--- |
| `200 OK` | Success | Request processed successfully. |
| `400 Bad Request` | Bad Request | Missing `X-Tenant-ID` header or invalid JSON. |
| `404 Not Found` | Not Found | Resource does not exist OR belongs to another tenant. |
| `500 Internal Server Error` | Server Error | Database connection failed or query error. |
