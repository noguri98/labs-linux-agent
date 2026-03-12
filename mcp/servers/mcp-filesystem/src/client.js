import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { MCPServer } from "./mcp/mcp.server.js";

class Application {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3003;
    const basePath = process.env.FILE_PATH || "/data";
    this.mcpServer = new MCPServer(basePath);
    this.transport = null;
  }

  setupRoutes() {
    this.app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });

    this.app.get("/sse", async (req, res) => {
      console.log("New SSE connection established");
      this.transport = new SSEServerTransport("/messages", res);
      await this.mcpServer.getServer().connect(this.transport);
    });

    this.app.post("/messages", async (req, res) => {
      if (this.transport) {
        await this.transport.handlePostMessage(req, res);
      } else {
        res.status(400).send("No transport established");
      }
    });
  }

  start() {
    this.setupRoutes();
    this.app.listen(this.port, "0.0.0.0", () => {
      console.log(`Filesystem MCP Server running on port ${this.port}`);
      console.log(`Base path: ${process.env.FILE_PATH || "/data"}`);
    });
  }
}

const app = new Application();
app.start();
