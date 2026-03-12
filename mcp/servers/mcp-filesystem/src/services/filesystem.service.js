import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

export class FilesystemService {
  constructor(basePath) {
    this.basePath = path.resolve(basePath);
  }

  _resolvePath(relativePath) {
    const resolvedPath = path.resolve(this.basePath, relativePath);
    if (!resolvedPath.startsWith(this.basePath)) {
      throw new Error(`Access denied: ${relativePath} is outside of base path.`);
    }
    return resolvedPath;
  }

  async readTextFile(args = {}) {
    try {
      const { filePath } = args;
      const fullPath = this._resolvePath(filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      return {
        content: [{ type: 'text', text: content }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error reading file: ${error.message}` }],
        isError: true
      };
    }
  }

  async readMediaFile(args = {}) {
    try {
      const { filePath } = args;
      const fullPath = this._resolvePath(filePath);
      const stats = await fs.stat(fullPath);
      return {
        content: [{
          type: 'text',
          text: `File: ${filePath}\nSize: ${stats.size} bytes\nMtime: ${stats.mtime}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error reading media file metadata: ${error.message}` }],
        isError: true
      };
    }
  }

  async readMultipleFiles(args = {}) {
    try {
      const { filePaths } = args;
      const results = await Promise.all(filePaths.map(async (fp) => {
        try {
          const fullPath = this._resolvePath(fp);
          const content = await fs.readFile(fullPath, 'utf8');
          return `--- ${fp} ---\n${content}`;
        } catch (err) {
          return `--- ${fp} ---\nError: ${err.message}`;
        }
      }));
      return {
        content: [{ type: 'text', text: results.join('\n\n') }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error reading multiple files: ${error.message}` }],
        isError: true
      };
    }
  }

  async writeFile(args = {}) {
    try {
      const { filePath, content } = args;
      const fullPath = this._resolvePath(filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf8');
      return {
        content: [{ type: 'text', text: `Successfully wrote to ${filePath}` }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error writing file: ${error.message}` }],
        isError: true
      };
    }
  }

  async editFile(args = {}) {
    try {
      const { filePath, content, append = false } = args;
      const fullPath = this._resolvePath(filePath);
      if (append) {
        await fs.appendFile(fullPath, content, 'utf8');
      } else {
        await fs.writeFile(fullPath, content, 'utf8');
      }
      return {
        content: [{ type: 'text', text: `Successfully edited ${filePath}` }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error editing file: ${error.message}` }],
        isError: true
      };
    }
  }

  async moveFile(args = {}) {
    try {
      const { sourcePath, destinationPath } = args;
      const fullSource = this._resolvePath(sourcePath);
      const fullDest = this._resolvePath(destinationPath);
      await fs.mkdir(path.dirname(fullDest), { recursive: true });
      await fs.rename(fullSource, fullDest);
      return {
        content: [{ type: 'text', text: `Successfully moved ${sourcePath} to ${destinationPath}` }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error moving file: ${error.message}` }],
        isError: true
      };
    }
  }

  async searchFiles(args = {}) {
    try {
      const { pattern } = args;
      const files = await glob(pattern, { cwd: this.basePath, nodir: true });
      return {
        content: [{ type: 'text', text: files.length > 0 ? files.join('\n') : "No files found." }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error searching files: ${error.message}` }],
        isError: true
      };
    }
  }

  async createDirectory(args = {}) {
    try {
      const { directoryPath } = args;
      const fullPath = this._resolvePath(directoryPath);
      await fs.mkdir(fullPath, { recursive: true });
      return {
        content: [{ type: 'text', text: `Successfully created directory ${directoryPath}` }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error creating directory: ${error.message}` }],
        isError: true
      };
    }
  }

  async listDirectory(args = {}) {
    try {
      const { directoryPath = "." } = args;
      const fullPath = this._resolvePath(directoryPath);
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      const list = entries.map(entry => `${entry.isDirectory() ? '[DIR]' : '[FILE]'} ${entry.name}`).join('\n');
      return {
        content: [{ type: 'text', text: list || "Directory is empty." }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error listing directory: ${error.message}` }],
        isError: true
      };
    }
  }

  async getDirectoryTree(args = {}) {
    try {
      const { directoryPath = "." } = args;
      const tree = await this._buildTree(directoryPath);
      return {
        content: [{ type: 'text', text: JSON.stringify(tree, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error generating directory tree: ${error.message}` }],
        isError: true
      };
    }
  }

  async _buildTree(relativePath) {
    const fullPath = this._resolvePath(relativePath);
    const stats = await fs.stat(fullPath);
    const node = {
      name: path.basename(fullPath) || relativePath,
      path: relativePath,
      type: stats.isDirectory() ? 'directory' : 'file'
    };

    if (stats.isDirectory()) {
      const entries = await fs.readdir(fullPath);
      node.children = await Promise.all(entries.map(entry =>
        this._buildTree(path.join(relativePath, entry))
      ));
    }
    return node;
  }

  async deleteDirectory(args = {}) {
    try {
      const { directoryPath, recursive = false } = args;
      const fullPath = this._resolvePath(directoryPath);
      await fs.rm(fullPath, { recursive, force: true });
      return {
        content: [{ type: 'text', text: `Successfully deleted directory ${directoryPath}` }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error deleting directory: ${error.message}` }],
        isError: true
      };
    }
  }

  async moveDirectory(args = {}) {
    try {
      const { sourcePath, destinationPath } = args;
      const fullSource = this._resolvePath(sourcePath);
      const fullDest = this._resolvePath(destinationPath);
      await fs.mkdir(path.dirname(fullDest), { recursive: true });
      await fs.rename(fullSource, fullDest);
      return {
        content: [{ type: 'text', text: `Successfully moved ${sourcePath} to ${destinationPath}` }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error moving directory: ${error.message}` }],
        isError: true
      };
    }
  }
}
