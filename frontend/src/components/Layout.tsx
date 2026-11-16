// NEXUS Layout Component — V0.1
import { NavLink, Outlet } from "react-router-dom";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import { checkHealth, HealthResponse } from "../lib/api/client";
import {
  Server,
  Database,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { path: "/projects", label: "Projects", icon: "FolderGit" },
  { path: "/repositories", label: "Repositories", icon: "GitBranch" },
  { path: "/skills", label: "Skills", icon: "BookOpen" },
  { path: "/mcp", label: "MCP", icon: "Server" },
  { path: "/applications", label: "Applications", icon: "Monitor" },
  { path: "/system", label: "System", icon: "HardDrive" },
  { path: "/activity", label: "Activity", icon: "Activity" },
  { path: "/settings", label: "Settings", icon: "Settings" },
];

export function Layout() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const h = await checkHealth();
        setHealth(h);
      } catch {
        setHealth({
          status: "unhealthy",
          version: "unknown",
          database: "unhealthy",
          timestamp: new Date().toISOString(),
        });
      } finally {
        setChecking(false);
      }
    };
    fetchHealth();

    // Refresh health every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: HealthResponse["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "degraded":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "unhealthy":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />;
    }
  };

  const getStatusText = (status: HealthResponse["status"]) => {
    switch (status) {
      case "healthy":
        return "Healthy";
      case "degraded":
        return "Degraded";
      case "unhealthy":
        return "Unhealthy";
      default:
        return checking ? "Checking..." : "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Server className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  NEXUS
                </h1>
              </div>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      clsx(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                        isActive
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700",
                      )
                    }
                  >
                    <span className="capitalize">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <Database className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                  {health?.database === "healthy"
                    ? "DB: OK"
                    : health?.database === "unhealthy"
                      ? "DB: DOWN"
                      : "DB: —"}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  API
                </span>
                {getStatusIcon(health?.status || "unknown")}
                <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                  {getStatusText(health?.status || "unknown")}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                v0.1.0
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500 dark:text-gray-400">
          NEXUS — Local-first management dashboard | Running on 127.0.0.1
        </div>
      </footer>
    </div>
  );
}
