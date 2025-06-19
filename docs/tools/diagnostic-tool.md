# Diagnostic Tool

The `diagnostic_tool` provides a way to run various diagnostic checks on the Tally MCP server to monitor its health and troubleshoot issues.

## Actions

The tool supports two main actions:

1.  **Run all diagnostics**: Executes the entire suite of diagnostic tools.
2.  **Run a single diagnostic**: Executes a specific diagnostic tool by name.

## Usage

### Run All Diagnostics

To run all available diagnostic checks, call the tool without any arguments.

**MCP Call:**
```json
{
  "tool": "diagnostic_tool",
  "args": {}
}
```

**Output:**
The output will be an array of `DiagnosticReport` objects, one for each tool that was run.

```json
[
  {
    "tool": "HealthCheckTool",
    "timestamp": "...",
    "overallStatus": "passing",
    "results": [
      {
        "check": "Tally API Connectivity",
        "status": "passing",
        "message": "Successfully connected to Tally API."
      }
    ]
  },
  {
    "tool": "SchemaValidator",
    "timestamp": "...",
    "overallStatus": "passing",
    "results": [
        // ... results
    ]
  }
]
```

### Run a Single Diagnostic

To run a specific diagnostic tool, provide the `toolName` in the arguments.

**MCP Call:**
```json
{
  "tool": "diagnostic_tool",
  "args": {
    "toolName": "PerformanceProfiler"
  }
}
```

**Output:**
The output will be a single `DiagnosticReport` object for the specified tool.

```json
{
  "tool": "PerformanceProfiler",
  "timestamp": "...",
  "overallStatus": "passing",
  "results": [
    {
      "check": "API: getWorkspaces latency",
      "status": "passing",
      "message": "getWorkspaces responded in 250ms."
    }
  ]
}
```

## Available Diagnostic Tools

The following tools are available to be run:

-   `HealthCheckTool`: Checks basic connectivity and service health.
-   `APIConnectivityTester`: Performs more in-depth tests of the Tally API.
-   `SchemaValidator`: Validates the schemas of all MCP tools.
-   `EnvironmentValidator`: Checks for required environment variables and dependencies.
-   `PerformanceProfiler`: Measures API response times.
-   `LogAnalyzer`: Checks for the existence of log files.
-   `DependencyChecker`: Checks for installed dependencies. 