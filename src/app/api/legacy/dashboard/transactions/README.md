# Transactions API

This API provides access to transaction data from the CarePoynt platform. It allows querying transactions with various filters and supports pagination.

## Endpoint

```
GET /api/legacy/dashboard/transactions
```

## Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | ISO Date (YYYY-MM-DD) | Optional start date for the transaction date range |
| `endDate` | ISO Date (YYYY-MM-DD) | Optional end date for the transaction date range |
| `memberId` | String | Optional member ID to filter transactions by member |
| `enterpriseId` | String | Optional enterprise ID to filter transactions by enterprise |
| `includeMetadata` | Boolean | Set to 'true' to include query metadata in the response |
| `page` | Number | Page number for pagination (default: 1) |
| `pageSize` | Number | Number of items per page (default: 50, max: 100) |

## Response Format

```json
{
  "transactions": [
    {
      "id": "123456",
      "cpid": "CP-ABC123",
      "cpidx": "CP-ABC",
      "result": "SUCCESS",
      "mode": "PURCHASE",
      "entity_type": "MEMBER",
      "transaction_date": "2023-01-01T12:00:00Z",
      "enterprise_id": "ENT123",
      "member_id": "MEM456",
      "metadata": "...",
      "poynts": 100,
      "provider_id": 2,
      "order_amount": 50.00,
      "provider_name": "Example Provider",
      "provider_code": "EP",
      "enterprise_name": "Example Enterprise",
      "member_name": "John Doe",
      "member_email": "john.doe@example.com"
      // ... additional fields
    }
    // ... more transactions
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalItems": 120,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "metadata": {
    // Only included when includeMetadata=true
    // Contains BigQuery query metadata
  }
}
```

## Error Response

```json
{
  "error": "Failed to fetch transaction data",
  "message": "Detailed error message"
}
```

## Examples

### Get transactions from the last 24 hours (default)

```
GET /api/legacy/dashboard/transactions
```

### Get transactions for a specific date range

```
GET /api/legacy/dashboard/transactions?startDate=2023-01-01&endDate=2023-01-31
```

### Get transactions for a specific member

```
GET /api/legacy/dashboard/transactions?memberId=MEM456&startDate=2023-01-01&endDate=2023-01-31
```

### Get transactions for a specific enterprise with pagination

```
GET /api/legacy/dashboard/transactions?enterpriseId=ENT123&page=2&pageSize=20
```

### Get transactions with query metadata

```
GET /api/legacy/dashboard/transactions?includeMetadata=true
```

## Notes

- If no date range is specified, the API defaults to returning transactions from the last 24 hours.
- The API applies pagination automatically. Use the pagination information in the response to navigate through the results.
- For large result sets, consider using smaller date ranges and pagination to improve performance. 