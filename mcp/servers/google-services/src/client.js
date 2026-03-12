import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { AuthManager } from "./auth/auth.manager.js";
import { MCPServer } from "./mcp/mcp.server.js";

class Application {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3002;
    this.authManager = new AuthManager(this.port);
    this.mcpServer = new MCPServer(this.authManager);
    this.transport = null;
  }

  setupRoutes() {
    this.app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });

    this.app.get("/auth", (req, res) => res.redirect(this.authManager.getAuthUrl()));
    this.app.get("/callback", async (req, res) => {
      const { code } = req.query;
      try {
        await this.authManager.handleCallback(code);
        res.send("Google Services Authentication successful! You can now use Calendar and Tasks.");
      } catch (error) {
        res.status(500).send(`Authentication failed: ${error.message}`);
      }
    });

    this.app.get("/sse", async (req, res) => {
      this.transport = new SSEServerTransport("/messages", res);
      await this.mcpServer.getServer().connect(this.transport);
    });

    this.app.post("/messages", async (req, res) => {
      if (this.transport) await this.transport.handlePostMessage(req, res);
      else res.status(400).send("No transport established");
    });
  }

  start() {
    this.setupRoutes();
    this.app.listen(this.port, "0.0.0.0", () => {
      console.log(`Google Unified Services MCP Server running on port ${this.port}`);
    });
  }
}

const app = new Application();
app.start();
