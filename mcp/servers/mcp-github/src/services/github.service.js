import { Octokit } from "@octokit/rest";
import fs from "fs/promises";
import path from "path";

export class GitHubService {
  constructor() {
    this.octokit = null;
    this.configPath = "/app/config/github.json";
    this.targetUser = "noguri98";
  }

  async _loadOctokit() {
    if (this.octokit) return;
    try {
      const config = JSON.parse(await fs.readFile(this.configPath, "utf8"));
      this.octokit = new Octokit({ auth: config.token });
    } catch (error) {
      console.error(`Error loading GitHub token: ${error.message}`);
      throw new Error("GitHub token not found in config.");
    }
  }

  async searchRepositories(args = {}) {
    try {
      await this._loadOctokit();
      const { q, sort, order, per_page, page } = args;
      // Enforce search within noguri98's account
      const restrictedQuery = `${q} user:${this.targetUser}`;
      const response = await this.octokit.search.repos({
        q: restrictedQuery,
        sort,
        order,
        per_page,
        page,
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(response.data.items, null, 2) },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching repositories: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async listRepositories(args = {}) {
    try {
      await this._loadOctokit();
      const { visibility, affiliation, type, sort, direction, per_page, page } =
        args;
      // Filter list to only show repositories for the target user
      const response = await this.octokit.repos.listForAuthenticatedUser({
        visibility,
        affiliation,
        type,
        sort,
        direction,
        per_page,
        page,
      });
      // Further filter results to ensure only noguri98's repos are returned if token has access to others
      const filteredData = response.data.filter(
        (repo) => repo.owner.login === this.targetUser,
      );
      return {
        content: [
          { type: "text", text: JSON.stringify(filteredData, null, 2) },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing repositories: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async createRepository(args = {}) {
    try {
      await this._loadOctokit();
      const { name, description, private: isPrivate, auto_init } = args;
      const response = await this.octokit.repos.createForAuthenticatedUser({
        name,
        description,
        private: isPrivate,
        auto_init,
      });
      return {
        content: [
          {
            type: "text",
            text: `Successfully created repository: ${response.data.html_url}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `Error creating repository: ${error.message}` },
        ],
        isError: true,
      };
    }
  }

  async updateRepository(args = {}) {
    try {
      await this._loadOctokit();
      const { repo, ...updateData } = args;
      // Force owner to noguri98
      const response = await this.octokit.repos.update({
        owner: this.targetUser,
        repo,
        ...updateData,
      });
      return {
        content: [
          {
            type: "text",
            text: `Successfully updated repository: ${response.data.html_url}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `Error updating repository: ${error.message}` },
        ],
        isError: true,
      };
    }
  }

  async listIssues(args = {}) {
    try {
      await this._loadOctokit();
      const { repo, state, labels, sort, direction, per_page, page } = args;
      // Force owner to noguri98
      const response = await this.octokit.issues.listForRepo({
        owner: this.targetUser,
        repo,
        state,
        labels,
        sort,
        direction,
        per_page,
        page,
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(response.data, null, 2) },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `Error listing issues: ${error.message}` },
        ],
        isError: true,
      };
    }
  }

  async createIssue(args = {}) {
    try {
      await this._loadOctokit();
      const { repo, title, body, labels, assignees } = args;
      // Force owner to noguri98
      const response = await this.octokit.issues.create({
        owner: this.targetUser,
        repo,
        title,
        body,
        labels,
        assignees,
      });
      return {
        content: [
          {
            type: "text",
            text: `Successfully created issue: ${response.data.html_url}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `Error creating issue: ${error.message}` },
        ],
        isError: true,
      };
    }
  }

  async closeIssue(args = {}) {
    try {
      await this._loadOctokit();
      const { repo, issue_number } = args;
      // Force owner to noguri98
      const response = await this.octokit.issues.update({
        owner: this.targetUser,
        repo,
        issue_number,
        state: "closed",
      });
      return {
        content: [
          {
            type: "text",
            text: `Successfully closed issue: ${response.data.html_url}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `Error closing issue: ${error.message}` },
        ],
        isError: true,
      };
    }
  }
}
