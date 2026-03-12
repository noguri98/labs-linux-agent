import { google } from "googleapis";
import fs from "fs/promises";
import path from "path";

const TOKEN_PATH = path.join(process.cwd(), "token.json");
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/tasks", // Added for Google Tasks
];

export class AuthManager {
  constructor(port) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || `http://localhost:${port}/callback`,
    );
  }

  async loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH, "utf8");
      const credentials = JSON.parse(content);
      this.oauth2Client.setCredentials(credentials);

      this.oauth2Client.on("tokens", (tokens) => {
        if (tokens.refresh_token) {
          credentials.refresh_token = tokens.refresh_token;
        }
        Object.assign(credentials, tokens);
        this.saveCredentials(credentials);
      });

      return true;
    } catch (err) {
      return false;
    }
  }

  async saveCredentials(tokens) {
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });
  }

  async handleCallback(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    await this.saveCredentials(tokens);
  }

  getAuthClient() {
    return this.oauth2Client;
  }
}
