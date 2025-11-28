This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started


pnpm dev


pnpm dlx shadcn@canary add input 

### VSCode

1. Ensure [Docker](https://docs.docker.com/engine/install) is installed and running.
1. Enable the project recommended extensions:
	- ms-azuretools.vscode-docker
	- ms-vscode-remote.remote-containers
1. Use the command palette to run `Dev Containers: Reopen in Container` or click the prompt in the lower right corner of the window to do the same.
1. Select the `CP Platform Portal` container from the dropdown.
1. Run `pnpm dev` to start the server.

## Setup

### Environment

Populate the following environment variables in a `.env.local` file.

  - `DB_HOST`: Database host.
  - `DB_SOCKET_PATH`: (Optional) Database socket path for Cloud SQL proxy connections.
  - `DB_NAME`: Database name.
  - `DB_PORT`: Database port.
  - `DB_USER`: Database username.
  - `DB_PASSWORD`: Database password.
  - `ENVIRONMENT`: Application environment (LOCAL, DEV, QA, etc.).
  - `DATADOG_ENVIRONMENT `: Use to track/log indatadog (well_local | well_dev | well_qa | well_prod)
  - `PORT`: (Optional) Server port. Defaults to 3000 locally, 8080 in Docker.
  - `HOSTNAME`: (Optional) Server bind address. Defaults to localhost locally, 0.0.0.0 in Docker.
  - `LOG_LEVEL`: (Optional) Log level (error, warn, info, debug). Defaults to info.
  - `CLERK_SECRET_KEY`: Clerk app's Secret Key.
  - `BIGQUERY_PROJECT_ID`: GCP BigQuery project ID.
  - `BIGQUERY_LOCATION`: GCP BigQuery project location.
  - `TANGO_PLATFORM_NAME`: 
  - `TANGO_API_KEY`: 
  - `DATADOG_API_KEY`: Datadog API key.
  - `DATADOG_APP_KEY`: Datadog Application key.
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk app's Publishable Key.
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: The full URL or path to the sign-up page.
  - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`: The fallback URL to redirect to after the user signs in.
  - `NEXT_PUBLIC_DEFAULT_ORG_ID`: Default Clerk organization ID for multi-tenant operation.
  - `PROVIDER_MAPPING_CACHE_TTL`: Provider mapping cache TTL in milliseconds. Default is 5 minutes.

### Pipeline

See [GitHub Actions: Setup](.github/workflows/workflows.md#setup) for actions setup.

## Testing

This project uses Vitest for testing. The following commands are available:

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm coverage
```

### Writing Tests

- Test files should be named `*.test.tsx` or `*.test.ts`
- Tests are located next to the files they test
- Use the testing utilities in `tests/test-utils.tsx` for rendering components
- Mock Next.js navigation functions using the mocks in `tests/mocks/next-navigation.ts`


build..
