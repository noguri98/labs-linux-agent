"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Terminal, Activity, Zap, Box } from "lucide-react"

export function ToolSidebar() {
  return (
    <Sidebar side="right" variant="inset" collapsible="none" className="w-80 hidden lg:flex border-l">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2 font-semibold">
          <Activity className="h-4 w-4 text-primary" />
          <span>Tool Activity</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Active Processes</SidebarGroupLabel>
          <SidebarGroupContent className="px-4 py-2">
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-3 text-xs">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground font-medium uppercase tracking-wider">
                  <Terminal className="h-3 w-3" />
                  <span>Thinking Process</span>
                </div>
                <p className="text-muted-foreground italic">
                  Waiting for user input...
                </p>
              </div>

              <div className="rounded-lg border bg-muted/50 p-3 text-xs">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground font-medium uppercase tracking-wider">
                  <Zap className="h-3 w-3" />
                  <span>Tools Used</span>
                </div>
                <div className="flex flex-wrap gap-2">
                   <span className="text-muted-foreground italic">No tools used yet</span>
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System Status</SidebarGroupLabel>
          <SidebarGroupContent className="px-4 py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">API Status</span>
                <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Ollama</span>
                <span className="text-primary font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">MCP Servers</span>
                <span className="text-primary font-medium">4 Active</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
