import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { FilesystemService } from "../services/filesystem.service.js";

export class MCPServer {
  constructor(basePath) {
    this.filesystemService = new FilesystemService(basePath);
    this.server = new Server(
      { name: "mcp-filesystem", version: "1.0.0" },
      { capabilities: { tools: {} } },
    );
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "read_text_file",
          description: "Read the content of a text file",
          inputSchema: {
            type: "object",
            properties: {
              filePath: { type: "string", description: "Relative path to the file" },
            },
            required: ["filePath"],
          },
        },
        {
          name: "read_media_file",
          description: "Read metadata of a media file",
          inputSchema: {
            type: "object",
            properties: {
              filePath: { type: "string", description: "Relative path to the file" },
            },
            required: ["filePath"],
          },
        },
        {
          name: "read_multiple_files",
          description: "Read the content of multiple text files",
          inputSchema: {
            type: "object",
            properties: {
              filePaths: {
                type: "array",
                items: { type: "string" },
                description: "Array of relative paths to the files"
              },
            },
            required: ["filePaths"],
          },
        },
        {
          name: "write_file",
          description: "Write content to a file (overwrites if exists)",
          inputSchema: {
            type: "object",
            properties: {
              filePath: { type: "string", description: "Relative path to the file" },
              content: { type: "string", description: "Content to write" },
            },
            required: ["filePath", "content"],
          },
        },
        {
          name: "edit_file",
          description: "Edit a file (append or overwrite)",
          inputSchema: {
            type: "object",
            properties: {
              filePath: { type: "string", description: "Relative path to the file" },
              content: { type: "string", description: "Content to write" },
              append: { type: "boolean", default: false, description: "Whether to append content" },
            },
            required: ["filePath", "content"],
          },
        },
        {
          name: "move_file",
          description: "Move or rename a file",
          inputSchema: {
            type: "object",
            properties: {
              sourcePath: { type: "string", description: "Current relative path" },
              destinationPath: { type: "string", description: "New relative path" },
            },
            required: ["sourcePath", "destinationPath"],
          },
        },
        {
          name: "search_files",
          description: "Search for files using a glob pattern",
          inputSchema: {
            type: "object",
            properties: {
              pattern: { type: "string", description: "Glob pattern (e.g., '**/*.md')" },
            },
            required: ["pattern"],
          },
        },
        {
          name: "create_directory",
          description: "Create a new directory",
          inputSchema: {
            type: "object",
            properties: {
              directoryPath: { type: "string", description: "Relative path to the directory" },
            },
            required: ["directoryPath"],
          },
        },
        {
          name: "list_directory",
          description: "List contents of a directory",
          inputSchema: {
            type: "object",
            properties: {
              directoryPath: { type: "string", description: "Relative path to the directory", default: "." },
            },
          },
        },
        {
          name: "get_directory_tree",
          description: "Get a recursive tree structure of a directory",
          inputSchema: {
            type: "object",
            properties: {
              directoryPath: { type: "string", description: "Relative path to the directory", default: "." },
            },
          },
        },
        {
          name: "delete_directory",
          description: "Delete a directory",
          inputSchema: {
            type: "object",
            properties: {
              directoryPath: { type: "string", description: "Relative path to the directory" },
              recursive: { type: "boolean", default: false, description: "Whether to delete recursively" },
            },
            required: ["directoryPath"],
          },
        },
        {
          name: "move_directory",
          description: "Move or rename a directory",
          inputSchema: {
            type: "object",
            properties: {
              sourcePath: { type: "string", description: "Current relative path" },
              destinationPath: { type: "string", description: "New relative path" },
            },
            required: ["sourcePath", "destinationPath"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "read_text_file":
          return await this.filesystemService.readTextFile(args);
        case "read_media_file":
          return await this.filesystemService.readMediaFile(args);
        case "read_multiple_files":
          return await this.filesystemService.readMultipleFiles(args);
        case "write_file":
          return await this.filesystemService.writeFile(args);
        case "edit_file":
          return await this.filesystemService.editFile(args);
        case "move_file":
          return await this.filesystemService.moveFile(args);
        case "search_files":
          return await this.filesystemService.searchFiles(args);
        case "create_directory":
          return await this.filesystemService.createDirectory(args);
        case "list_directory":
          return await this.filesystemService.listDirectory(args);
        case "get_directory_tree":
          return await this.filesystemService.getDirectoryTree(args);
        case "delete_directory":
          return await this.filesystemService.deleteDirectory(args);
        case "move_directory":
          return await this.filesystemService.moveDirectory(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  getServer() {
    return this.server;
  }
}
