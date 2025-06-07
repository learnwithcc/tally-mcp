# Deploying to Cloudflare Workers

This guide will walk you through deploying the Tally MCP Server to Cloudflare Workers.

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up).
- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

## 1. Login to Cloudflare

First, you need to log in to your Cloudflare account from the command line:

```bash
npx wrangler login
```

This will open a browser window for you to log in.

## 2. Configure Your Worker

The project includes a `wrangler.toml` file, which is the configuration file for Cloudflare Workers. You may want to update the `name` of the worker in this file to something unique for your account.

You will also need to set up your Tally.so API token as a secret for your worker:

```bash
npx wrangler secret put TALLY_API_TOKEN
```

You will be prompted to enter the value for your token.

## 3. Deploy

Once you are logged in and have configured your secrets, you can deploy the application:

```bash
npm run deploy:cloudflare
```

This command will build the project and deploy it to Cloudflare Workers. After the deployment is complete, you will see a URL for your new worker, for example: `https://tally-mcp.<your-subdomain>.workers.dev`.

## 4. Post-Deployment Verification

To verify that your deployment was successful, you can send a request to your worker's URL. For example, you can use `curl`:

```bash
curl https://tally-mcp.<your-subdomain>.workers.dev
```

You should see the welcome message from the server.

## 5. Rollback

If you need to roll back to a previous deployment, you can do so from the Cloudflare dashboard:
1.  Go to **Workers & Pages**.
2.  Select your worker.
3.  Go to the **Deployments** tab.
4.  You can view the history of your deployments and roll back to a specific version. 