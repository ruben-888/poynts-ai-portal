# Transaction Count API

This is a simplified endpoint that only returns the count of transactions without any complex joins or additional data. It should be much more efficient than the full transactions endpoint.

## Endpoint

```
GET /api/legacy/dashboard/transactions/count
```

## Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | ISO Date String | Optional. Start date for the transaction query. Default is 24 hours ago. |
| endDate | ISO Date String | Optional. End date for the transaction query. Default is current time. |

## Response Format

```json
{
  "success": true,
  "count": 123,
  "timestamp": "2023-01-01T00:00:00.000Z",
  "dateRange": {
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2023-01-02T00:00:00.000Z"
  }
}
```

## Error Response

```json
{
  "success": false,
  "error": "Failed to fetch transaction count",
  "message": "Error message details"
}
```

## Example Usage

### Basic Request

```
GET /api/legacy/dashboard/transactions/count
```

### With Date Range

```
GET /api/legacy/dashboard/transactions/count?startDate=2023-01-01&endDate=2023-01-31
```

## Implementation Notes

This endpoint uses a simplified BigQuery query that only counts transactions without performing any joins or fetching additional data. This makes it much more efficient than the full transactions endpoint.

The query used is:

```sql
SELECT
  COUNT(*) as count
FROM `cp-platform-prod.legacy_com_carepoynt_well_prod.cp_transactionlog` tr
WHERE tr.date >= CAST(TIMESTAMP(@startDate) AS DATETIME)
  AND tr.date <= CAST(TIMESTAMP(@endDate) AS DATETIME)
```

## Performance Considerations

- This endpoint should be much faster than the full transactions endpoint
- It only performs a COUNT operation without any JOINs
- It doesn't fetch or process any transaction details
- It's suitable for dashboard metrics where only the count is needed 