import { google } from "googleapis";

export class TasksService {
  constructor(authClient) {
    this.tasks = google.tasks({
      version: "v1",
      auth: authClient,
    });
  }

  async listTaskLists() {
    const res = await this.tasks.tasklists.list();
    const taskLists = res.data.items || [];
    if (taskLists.length === 0)
      return { content: [{ type: "text", text: "No task lists found." }] };
    return {
      content: [
        {
          type: "text",
          text: taskLists
            .map((tl) => `ID: ${tl.id} | Title: ${tl.title}`)
            .join("\n"),
        },
      ],
    };
  }

  async listTasks(args = {}) {
    try {
      const { tasklist = "@default", showCompleted = false } = args;
      const res = await this.tasks.tasks.list({
        tasklist,
        showCompleted,
      });
      const items = res.data.items || [];
      if (items.length === 0)
        return {
          content: [{ type: "text", text: "No tasks found in this list." }],
        };
      const taskListStr = items
        .map((t) => `ID: ${t.id} | Title: ${t.title} [${t.status}]`)
        .join("\n");
      return { content: [{ type: "text", text: `Tasks:\n${taskListStr}` }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }

  async createTask(args = {}) {
    try {
      const { title, notes, due, tasklist = "@default" } = args;
      await this.tasks.tasks.insert({
        tasklist,
        requestBody: { title, notes, due },
      });
      return {
        content: [
          { type: "text", text: `Task '${title}' created successfully.` },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }

  async updateTask(args = {}) {
    try {
      const { taskId, title, notes, status, tasklist = "@default" } = args;
      await this.tasks.tasks.patch({
        tasklist,
        task: taskId,
        requestBody: { title, notes, status },
      });
      return {
        content: [
          { type: "text", text: `Task ID '${taskId}' updated successfully.` },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }

  async deleteTask(args = {}) {
    try {
      const { taskId, tasklist = "@default" } = args;
      await this.tasks.tasks.delete({
        tasklist,
        task: taskId,
      });
      return {
        content: [
          { type: "text", text: `Task ID '${taskId}' deleted successfully.` },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
}
