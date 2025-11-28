# BigQuery Integration

This module provides a simple interface for connecting to Google BigQuery and executing queries for dashboard reporting.

## Configuration

The BigQuery client is configured using environment variables:

- `BIGQUERY_PROJECT_ID`: Your Google Cloud project ID (default: "cp-platform-prod")
- `BIGQUERY_LOCATION`: The BigQuery dataset location (default: "US")

You can also provide authentication credentials in one of two ways:

1. Using a service account key file (recommended for local development)
2. Using service account credentials directly (recommended for production)

## Authentication

### Option 1: Service Account Key File

1. Create a service account in the Google Cloud Console with BigQuery permissions
2. Download the service account key file (JSON)
3. Set the path to the key file in your environment variables:

```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-service-account-key.json
```

### Option 2: Service Account Credentials

For production environments, you can provide the credentials directly:

```typescript
import { createBigQueryClient } from '@/interfaces/bigquery';

const client = createBigQueryClient({
  projectId: 'your-project-id',
  credentials: {
    client_email: 'your-service-account-email@your-project.iam.gserviceaccount.com',
    private_key: 'your-private-key'
  }
});
```

## Usage Examples

### Basic Query

```typescript
import { bigQueryClient } from '@/interfaces/bigquery';

async function getTransactionCount() {
  const query = `
    SELECT COUNT(*) as count
    FROM \`your-project.dataset.table\`
    WHERE date = @date
  `;

  const results = await bigQueryClient.executeQuery({
    query,
    params: {
      date: '2023-01-01'
    }
  });

  return results[0].count;
}
```

### Query with Metadata

```typescript
import { bigQueryClient } from '@/interfaces/bigquery';

async function getTransactionData() {
  const query = `
    SELECT date, amount
    FROM \`your-project.dataset.table\`
    WHERE date BETWEEN @startDate AND @endDate
    ORDER BY date
  `;

  const { rows, metadata } = await bigQueryClient.executeQueryWithMetadata({
    query,
    params: {
      startDate: '2023-01-01',
      endDate: '2023-01-31'
    }
  });

  console.log('Query statistics:', metadata.statistics);
  return rows;
}
```

## Dashboard Integration

The BigQuery integration is used in the dashboard to display metrics from BigQuery data. See the following files for implementation details:

- `src/services/reports/bigquery.ts`: Service for fetching dashboard data from BigQuery
- `src/components/dashboard/BigQueryMetrics.tsx`: Component for displaying BigQuery metrics
- `src/app/(admin)/admin/dashboard/bigquery/page.tsx`: Example page using BigQuery metrics

## Error Handling

The BigQuery client includes error handling that logs errors to the console and rethrows them for handling by the calling code. You should wrap your BigQuery calls in try/catch blocks to handle errors appropriately.

```typescript
try {
  const data = await bigQueryClient.executeQuery({ query: 'your query' });
  // Process data
} catch (error) {
  console.error('BigQuery error:', error);
  // Handle error (e.g., show error message to user)
}
``` 