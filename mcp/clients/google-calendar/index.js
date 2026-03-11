import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { google } from "googleapis";
import express from "express";
import fs from "fs/promises";
import path from "path";

const TOKEN_PATH = path.join(process.cwd(), "token.json");
const app = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3002/callback"
);

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly", "https://www.googleapis.com/auth/calendar.events"];

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH, "utf8");
    const credentials = JSON.parse(content);
    oauth2Client.setCredentials(credentials);
    return true;
  } catch (err) {
    return false;
  }
}

async function saveCredentials(tokens) {
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
}

const server = new Server(
  {
    name: "google-calendar-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_events",
        description: "List upcoming events from Google Calendar",
        inputSchema: {
          type: "object",
          properties: {
            calendarId: { type: "string", default: "primary" },
            maxResults: { type: "number", default: 10 },
          },
        },
      },
      {
        name: "create_event",
        description: "Create a new event in Google Calendar",
        inputSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            location: { type: "string" },
            description: { type: "string" },
            start: { type: "string", description: "ISO 8601 date string" },
            end: { type: "string", description: "ISO 8601 date string" },
          },
          required: ["summary", "start", "end"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const hasAuth = await loadSavedCredentialsIfExist();
  if (!hasAuth) {
    return {
      content: [{ type: "text", text: "Error: Google Calendar not authenticated. Please visit /auth to authorize or copy token.json." }],
      isError: true,
    };
  }

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  switch (request.params.name) {
    case "list_events": {
      try {
        const { calendarId = "primary", maxResults = 10 } = request.params.arguments || {};
        const res = await calendar.events.list({
          calendarId,
          timeMin: new Date().toISOString(),
          maxResults,
          singleEvents: true,
          orderBy: "startTime",
        });
        const events = res.data.items;
        if (!events || events.length === 0) {
          return { content: [{ type: "text", text: "No upcoming events found." }] };
        }
        const eventList = events.map((event) => `${event.summary} (${event.start.dateTime || event.start.date})`).join("\n");
        return { content: [{ type: "text", text: `Upcoming events:\n${eventList}` }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error listing events: ${error.message}` }], isError: true };
      }
    }
    case "create_event": {
      try {
        const { summary, location, description, start, end } = request.params.arguments || {};
        await calendar.events.insert({
          calendarId: "primary",
          requestBody: {
            summary,
            location,
            description,
            start: { dateTime: start },
            end: { dateTime: end },
          },
        });
        return { content: [{ type: "text", text: `Event '${summary}' created successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating event: ${error.message}` }], isError: true };
      }
    }
    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

app.get("/auth", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    await saveCredentials(tokens);
    res.send("Authentication successful! You can close this window.");
  } catch (error) {
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
});

let transport;

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("No transport established");
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Google Calendar MCP Server running on port ${PORT}`);
});
