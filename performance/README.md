# Performance Testing

This directory contains the configuration for performance and load testing the Tally MCP server using [Artillery](https://artillery.io/).

## Setup

1.  **Install Dependencies:** Ensure you have the necessary development dependencies installed:
    ```bash
    npm install
    ```

2.  **Start the Server:** Before running any tests, you must have the local development server running.
    ```bash
    npm run dev
    ```

## Running Tests

### Standard Performance Test

This test runs a moderate load against the server to check for baseline performance and capture metrics.

```bash
npm run test:performance
```

This is an alias for:
`npx artillery run performance/artillery.yml`

### Stress Test

This test simulates a high number of concurrent users to check the server's stability under heavy load.

```bash
npm run test:stress
```

This is an alias for:
`npx artillery run performance/stress-test.yml`

## Understanding the Output

The tests will output a summary of the results to the console, including:
- Requests per second
- Response times (min, max, median, p95, p99)
- HTTP status codes
- Any errors encountered 