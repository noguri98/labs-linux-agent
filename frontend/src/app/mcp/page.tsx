"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle2,
  Server,
  Terminal,
  Info,
} from "lucide-react";

interface MCPStatus {
  status: string;
  server_urls: string[];
  tool_count?: number;
  tools?: any[];
  error?: string;
}

const BACKEND_HOST = process.env.NEXT_PUBLIC_ADMIN_BACKEND_HOST || "localhost";
const BACKEND_URL = `http://${BACKEND_HOST}:8000`;

export default function MCPPage() {
  const [status, setStatus] = useState<MCPStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/mcp/status`);
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        setStatus({
          status: "error",
          error: "Failed to connect to backend",
          server_urls: ["Unknown"],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl font-semibold">
          Loading MCP Status...
        </div>
      </div>
    );
  }

  const isConnected =
    status?.status === "connected" || status?.status === "connected_no_tools";

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">MCP Server Status</h1>
        <p className="text-muted-foreground">
          Monitor the connection between the backend and MCP server.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge
                variant={isConnected ? "default" : "destructive"}
                className="flex gap-1 items-center"
              >
                {isConnected ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" /> Offline
                  </>
                )}
              </Badge>
            </div>
            <Separator />
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">
                Server URLs:
              </span>
              <div className="space-y-2">
                {status?.server_urls && status.server_urls.length > 0 ? (
                  status.server_urls.map((url, idx) => (
                    <p
                      key={idx}
                      className="text-[10px] font-mono break-all bg-muted p-2 rounded"
                    >
                      {url}
                    </p>
                  ))
                ) : (
                  <p className="text-sm font-mono break-all bg-muted p-2 rounded">
                    No URLs found
                  </p>
                )}
              </div>
            </div>

            {status?.error && (
              <div className="p-3 bg-destructive/10 text-destructive text-xs rounded border border-destructive/20">
                <strong>Error:</strong> {status.error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Available Tools
              </CardTitle>
              <CardDescription>
                Tools currently available for the AI to use.
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-6">
              {status?.tool_count || 0} Tools
            </Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {status?.tools && status.tools.length > 0 ? (
                <div className="space-y-4">
                  {status.tools.map((tool, idx) => (
                    <div
                      key={idx}
                      className="group p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-primary">
                          {tool.function.name}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          mcp-server
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {tool.function.description}
                      </p>
                      <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                        <div className="flex items-center gap-1 mb-1 text-muted-foreground">
                          <Info className="w-3 h-3" />
                          <span>Input Schema</span>
                        </div>
                        <pre className="overflow-x-auto">
                          {JSON.stringify(tool.function.parameters, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground italic border-2 border-dashed rounded-lg">
                  No tools found or server disconnected.
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
