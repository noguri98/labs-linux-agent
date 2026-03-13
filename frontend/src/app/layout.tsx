import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ToolSidebar } from "@/components/ToolSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Agent - Intelligent Workspace",
  description: "Advanced AI Assistant powered by MCP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex flex-1 flex-col relative">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 sticky top-0 z-30">
                  <SidebarTrigger />
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Workspace
                    </h2>
                  </div>
                </header>
                <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950">
                  {children}
                </div>
              </main>
              <ToolSidebar />
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
