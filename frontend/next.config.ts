import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

/**
 * Loads environment variables from the project root .env file (hybrid setup support).
 */
const loadRootEnv = () => {
  const rootEnvPath = path.resolve(process.cwd(), "..", ".env");
  if (!fs.existsSync(rootEnvPath)) return {};

  const lines = fs.readFileSync(rootEnvPath, "utf8").split("\n");
  const env: Record<string, string> = {};

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
    
    const [key, ...values] = trimmed.split("=");
    const k = key.trim();
    const v = values.join("=").trim().replace(/^["']|["']$/g, "");
    
    if (k) env[k] = v;
  });
  
  return env;
};

const rootEnv = loadRootEnv();

const nextConfig: NextConfig = {
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_ADMIN_BACKEND_HOST: rootEnv.NEXT_PUBLIC_ADMIN_BACKEND_HOST || process.env.NEXT_PUBLIC_ADMIN_BACKEND_HOST,
  },
};

export default nextConfig;
