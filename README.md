# Tally MCP Server

## 1. Project Overview

The Tally MCP (Model Context Protocol) Server is a powerful backend service designed to connect AI agents and development tools like Cursor to the Tally.so API. It allows for the management and automation of Tally.so forms through natural language commands, streamlining form creation, modification, and data retrieval workflows.

This server exposes a set of tools through the Model Context Protocol, enabling intelligent agents to interact with Tally.so in a structured and predictable way.

## 2. Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## 3. Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/tally-mcp.git
    cd tally-mcp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Now, open the `.env` file and add your Tally.so API token and any other required configuration.

## 4. Quick Start

To start the server in development mode, run:

```bash
npm run dev
```

The server will start, and you should see log output indicating that it is ready to accept connections. By default, it runs on `http://localhost:3000`.

To run the production build:
```bash
# First, build the project
npm run build

# Then, start the server
npm start
```

## 5. Configuration

The server can be configured through the `.env` file. Key options include:
- `PORT`: The port the server will listen on.
- `HOST`: The host address.
- `TALLY_API_TOKEN`: Your API token for Tally.so.
- `DEBUG`: Set to `true` to enable debug logging.

## 6. Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/your-feature`).
5.  Open a Pull Request.

Please make sure to update tests as appropriate.

## 7. License

This project is licensed under the ISC License. See the `LICENSE` file for details. 