# Logging Configuration

This document provides guidance on configuring logging for the Tally MCP Server.

## 1. Log Levels

The application uses `console.log`, `console.warn`, and `console.error` for logging. For more advanced logging, you can integrate a library like [Pino](https://getpino.io/) or [Winston](https://github.com/winstonjs/winston).

A typical set of log levels would be:
- `error`: For critical errors that require immediate attention.
- `warn`: For potential issues that do not prevent the application from running.
- `info`: For general information about application state and events.
- `debug`: For detailed information useful for debugging.

You can control the verbosity of the logs by setting a `LOG_LEVEL` environment variable and using it in your logging library's configuration.

## 2. Log Format

For production environments, it is recommended to use a structured logging format, such as JSON. This makes it easier to parse and analyze logs with tools like Elasticsearch, Splunk, or Datadog.

A typical JSON log entry might include:
- `timestamp`
- `level` (e.g., "info", "error")
- `message`
- `context` (an object with additional data, like `formId` or `userId`)

## 3. Log Retention

Log retention policies depend on your organization's requirements. For cloud-based logging services, you can typically configure retention policies directly in the service.

If you are logging to files, you will need to set up a log rotation system (e.g., using `logrotate`) to prevent log files from growing indefinitely.

## 4. Example with Pino

If you choose to use Pino, you can configure it as follows:

1.  **Install Pino:**
    ```bash
    npm install pino pino-pretty
    ```

2.  **Create a logger utility:**
    ```typescript
    // src/utils/logger.ts
    import pino from 'pino';

    const logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      }
    });

    export default logger;
    ```

3.  **Use the logger in your application:**
    ```typescript
    import logger from './utils/logger';

    logger.info({ formId: '123' }, 'Form created successfully');
    ``` 