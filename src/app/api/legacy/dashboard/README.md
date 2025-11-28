# Dashboard API

## Overview

The Dashboard API provides transaction metrics and analytics data for the CarePoynt portal. This endpoint returns key business metrics including transaction counts, amounts, rebate information, and member data.

## Endpoint

```
GET /api/legacy/dashboard
```

## Query Parameters

| Parameter  | Type   | Required | Description                                      |
|------------|--------|----------|--------------------------------------------------|
| startDate  | string | No       | Start date for the data range (ISO format)       |
| endDate    | string | No       | End date for the data range (ISO format)         |
| full       | boolean| No       | Set to 'true' to get full dashboard data (default: false) |

If no dates are provided, the endpoint defaults to month-to-date (from the first day of the current month to the current date).

## Response Modes

The dashboard API supports two modes:

### 1. Simplified Mode (Default)

This mode returns only the transaction count and is optimized for performance. It's much faster than the full mode and is suitable for most dashboard needs.

```json
{
  "success": true,
  "data": {
    "transactions": {
      "count": 123
    },
    "timestamp": "2023-03-15T12:34:56.789Z",
    "dateRange": {
      "current": {
        "start": "2023-03-01T00:00:00.000Z",
        "end": "2023-03-15T23:59:59.999Z"
      }
    }
  }
}
```

### 2. Full Mode (Use ?full=true)

This mode returns comprehensive metrics including transaction counts, amounts, rebate information, and member data with period comparisons. It's more resource-intensive but provides complete analytics.

```json
{
  "success": true,
  "data": {
    "transactions": {
      "count": 123,
      "countChange": 5.2,
      "avgAmount": 45.67,
      "avgAmountChange": 2.3,
      "totalAmount": 5617.41,
      "totalAmountChange": 7.5
    },
    "rebate": {
      "amount": 561.74,
      "amountChange": 8.1
    },
    "members": {
      "newCount": 15,
      "newCountChange": 3.2
    },
    "timestamp": "2023-03-15T12:34:56.789Z",
    "dateRange": {
      "current": {
        "start": "2023-03-01T00:00:00.000Z",
        "end": "2023-03-15T23:59:59.999Z"
      },
      "previous": {
        "start": "2023-02-14T00:00:00.000Z",
        "end": "2023-02-28T23:59:59.999Z"
      }
    }
  }
}
```

## Period Comparison Logic (Full Mode Only)

The dashboard provides comparison metrics between the current period and a previous equivalent period:

1. **Current Period**: The date range specified in the request parameters (or default month-to-date)
2. **Previous Period**: An equivalent time period immediately preceding the current period

The comparison logic works as follows:

- The previous period has the same duration as the current period
- The previous period ends the day before the current period starts
- The previous period starts by subtracting the current period's duration from the previous period's end date

### Examples

| Current Period | Previous Period | Explanation |
|----------------|----------------|-------------|
| March 1-15 | February 14-28 | 15 days before March 1 |
| Q1 (Jan 1-Mar 31) | Oct 2-Dec 31 | 90 days before Jan 1 |
| Custom (May 10-June 20) | March 29-May 9 | 42 days before May 10 |

This approach ensures that comparisons are made between equivalent time periods, providing meaningful business analytics.

## Metrics Calculation (Full Mode Only)

- **Count Change**: Percentage change in transaction count compared to previous period
- **Average Amount Change**: Percentage change in average transaction amount
- **Total Amount Change**: Percentage change in total transaction amount
- **Rebate Amount Change**: Percentage change in total rebate amount
- **New Members Change**: Percentage change in new member registrations

All percentage changes are calculated using the formula:
```
((current - previous) / previous) * 100
```

## Performance Considerations

- The simplified mode (default) is significantly faster, typically responding in 2-3 seconds
- The full mode is more resource-intensive and may take 30+ seconds to respond
- For most dashboard use cases, the simplified mode is recommended

## Error Response

```json
{
  "success": false,
  "error": "An error occurred in the dashboard endpoint",
  "details": "Error message details"
}
``` 