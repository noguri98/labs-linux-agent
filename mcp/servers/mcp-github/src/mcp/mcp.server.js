import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { GitHubService } from "../services/github.service.js";

export class MCPServer {
  constructor() {
    this.githubService = new GitHubService();
    this.server = new Server(
      { name: "mcp-github", version: "1.0.0" },
      { capabilities: { tools: {} } },
    );
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "search_repositories",
          description:
            "Search for GitHub repositories (restricted to user: noguri98)",
          inputSchema: {
            type: "object",
            properties: {
              q: {
                type: "string",
                description: "The search query (e.g., 'topic:mcp')",
              },
              sort: {
                type: "string",
                enum: ["stars", "forks", "help-wanted-issues", "updated"],
                default: "best match",
              },
              order: { type: "string", enum: ["desc", "asc"], default: "desc" },
              per_page: { type: "number", default: 30 },
              page: { type: "number", default: 1 },
            },
            required: ["q"],
          },
        },
        {
          name: "list_repositories",
          description:
            "List repositories for the authenticated user (restricted to noguri98)",
          inputSchema: {
            type: "object",
            properties: {
              visibility: {
                type: "string",
                enum: ["all", "public", "private"],
                default: "all",
              },
              affiliation: {
                type: "string",
                description:
                  "Comma-separated list of values. Can include: owner, collaborator, organization_member",
              },
              type: {
                type: "string",
                enum: ["all", "owner", "public", "private", "member"],
                default: "all",
              },
              sort: {
                type: "string",
                enum: ["created", "updated", "pushed", "full_name"],
                default: "full_name",
              },
              direction: { type: "string", enum: ["asc", "desc"] },
              per_page: { type: "number", default: 30 },
              page: { type: "number", default: 1 },
            },
          },
        },
        {
          name: "create_repository",
          description:
            "Create a new repository for the authenticated user (noguri98)",
          inputSchema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The name of the repository",
              },
              description: {
                type: "string",
                description: "A short description of the repository",
              },
              private: {
                type: "boolean",
                default: false,
                description: "Whether the repository is private",
              },
              auto_init: {
                type: "boolean",
                default: false,
                description:
                  "Whether to create an initial commit with an empty README",
              },
            },
            required: ["name"],
          },
        },
        {
          name: "update_repository",
          description:
            "Update an existing repository (restricted to owner: noguri98)",
          inputSchema: {
            type: "object",
            properties: {
              repo: {
                type: "string",
                description: "The name of the repository",
              },
              name: {
                type: "string",
                description: "The new name of the repository",
              },
              description: {
                type: "string",
                description: "The new description",
              },
              private: {
                type: "boolean",
                description: "Whether the repository should be private",
              },
              has_issues: {
                type: "boolean",
                description: "Whether to enable issues",
              },
              has_projects: {
                type: "boolean",
                description: "Whether to enable projects",
              },
              has_wiki: {
                type: "boolean",
                description: "Whether to enable the wiki",
              },
            },
            required: ["repo"],
          },
        },
        {
          name: "list_issues",
          description:
            "List issues for a repository (restricted to owner: noguri98)",
          inputSchema: {
            type: "object",
            properties: {
              repo: {
                type: "string",
                description: "The name of the repository",
              },
              state: {
                type: "string",
                enum: ["open", "closed", "all"],
                default: "open",
              },
              labels: {
                type: "string",
                description: "Comma-separated list of label names",
              },
              sort: {
                type: "string",
                enum: ["created", "updated", "comments"],
                default: "created",
              },
              direction: {
                type: "string",
                enum: ["asc", "desc"],
                default: "desc",
              },
              per_page: { type: "number", default: 30 },
              page: { type: "number", default: 1 },
            },
            required: ["repo"],
          },
        },
        {
          name: "create_issue",
          description:
            "Create a new issue in a repository (restricted to owner: noguri98)",
          inputSchema: {
            type: "object",
            properties: {
              repo: {
                type: "string",
                description: "The name of the repository",
              },
              title: { type: "string", description: "The title of the issue" },
              body: {
                type: "string",
                description: "The contents of the issue",
              },
              labels: {
                type: "array",
                items: { type: "string" },
                description: "Labels to associate with this issue",
              },
              assignees: {
                type: "array",
                items: { type: "string" },
                description: "Logins for Users to whom to assign this issue",
              },
            },
            required: ["repo", "title"],
          },
        },
        {
          name: "close_issue",
          description:
            "Close an existing issue (restricted to owner: noguri98)",
          inputSchema: {
            type: "object",
            properties: {
              repo: {
                type: "string",
                description: "The name of the repository",
              },
              issue_number: {
                type: "number",
                description: "The number of the issue to close",
              },
            },
            required: ["repo", "issue_number"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "search_repositories":
          return await this.githubService.searchRepositories(args);
        case "list_repositories":
          return await this.githubService.listRepositories(args);
        case "create_repository":
          return await this.githubService.createRepository(args);
        case "update_repository":
          return await this.githubService.updateRepository(args);
        case "list_issues":
          return await this.githubService.listIssues(args);
        case "create_issue":
          return await this.githubService.createIssue(args);
        case "close_issue":
          return await this.githubService.closeIssue(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  getServer() {
    return this.server;
  }
}
