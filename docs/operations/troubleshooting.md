# Troubleshooting Guide

This guide provides solutions to common problems you may encounter when using the Tally MCP Server.

## 1. Installation Issues

### `npm install` fails

- **Check your Node.js version:** Ensure you are using Node.js v18.0.0 or higher. You can check your version with `node -v`.
- **Clear npm cache:** Sometimes the npm cache can get corrupted. Try clearing it with `npm cache clean --force`.
- **Delete `node_modules` and `package-lock.json`:** If the above steps don't work, delete the `node_modules` directory and the `package-lock.json` file, then run `npm install` again.

## 2. Connection Errors

### "Could not connect to Tally.so API"

- **Check your API token:** Ensure that your `TALLY_API_TOKEN` in the `.env` file is correct and has the necessary permissions.
- **Check your network connection:** Make sure you have a stable internet connection and that you are not behind a firewall that is blocking access to the Tally.so API.

## 3. Docker Issues

### `docker-compose up` fails

- **Ensure Docker is running:** Make sure the Docker daemon is running on your machine.
- **Check for port conflicts:** If you see an error about a port being already in use, it means another application is using port 3000. You can either stop the other application or change the port mapping in `docker-compose.yml`. For example, to use port 3001 on your host machine, change `ports` to `"3001:3000"`.

## 4. General Debugging

- **Enable debug logging:** Set `DEBUG=true` in your `.env` file to get more detailed log output. This can help you identify the source of the problem.
- **Check the server logs:** The server logs will often contain valuable information about what went wrong. If you are running the server directly, the logs will be in your terminal. If you are using Docker, you can view the logs with `docker-compose logs -f`. 