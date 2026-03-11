import Docker from "dockerode";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export const dockerTools = [
  {
    name: "list_containers",
    description: "List all running Docker containers",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      const containers = await docker.listContainers();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(containers, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "get_container_info",
    description: "Get detailed information about a specific container",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Container ID or name" },
      },
      required: ["id"],
    },
    handler: async (args) => {
      const containerId = args.id;
      const container = docker.getContainer(containerId);
      const data = await container.inspect();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  },
];
