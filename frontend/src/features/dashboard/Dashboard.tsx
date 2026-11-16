// Dashboard Feature — V0.1 implementation
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import {
  checkHealth,
  getVersion,
  HealthResponse,
  VersionResponse,
} from "../../lib/api/client";
import {
  Server,
  Database,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  FolderGit,
  GitBranch,
  BookOpen,
  Monitor,
  HardDrive,
  Activity,
  Settings,
  Box,
  Zap,
} from "lucide-react";

type FeatureStatus = "implemented" | "in_progress" | "planned";

const featureItems: {
  path: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: FeatureStatus;
  version: string;
}[] = [
  {
    path: "/projects",
    label: "Projects",
    description:
      "Register projects, categories, tags, Git state, launch Claude Code",
    icon: FolderGit,
    status: "planned",
    version: "V0.2",
  },
  {
    path: "/repositories",
    label: "Repositories",
    description:
      "Add public repos, fetch metadata/README, categorize, link to projects",
    icon: GitBranch,
    status: "planned",
    version: "V0.3",
  },
  {
    path: "/skills",
    label: "Skills",
    description:
      "Inventory, preview, install, update, uninstall with staging/backups",
    icon: BookOpen,
    status: "planned",
    version: "V0.5",
  },
  {
    path: "/mcp",
    label: "MCP Servers",
    description: "Inventory scopes, status, guarded CLI-based add/remove",
    icon: Server,
    status: "planned",
    version: "V0.6",
  },
  {
    path: "/applications",
    label: "Applications",
    description: "Register local apps, start/stop/health-check, PID tracking",
    icon: Monitor,
    status: "planned",
    version: "V0.7",
  },
  {
    path: "/system",
    label: "System Explorer",
    description: "Read-only inventory of Claude config, skills, MCP, Git repos",
    icon: HardDrive,
    status: "planned",
    version: "V0.4",
  },
  {
    path: "/activity",
    label: "Activity Timeline",
    description:
      "Append-only event log, outbox, deterministic Markdown projection",
    icon: Activity,
    status: "planned",
    version: "V0.8",
  },
  {
    path: "/settings",
    label: "Settings",
    description:
      "Vault path, scan roots, Claude executable, sync toggle, log level",
    icon: Settings,
    status: "planned",
    version: "V0.9",
  },
];

const statusConfig = {
  implemented: {
    label: "Implemented",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  planned: {
    label: "Planned",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  },
};

function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

function FeatureCard({ item }: { item: (typeof featureItems)[0] }) {
  const Icon = item.icon;
  return (
    <div className="card p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {item.label}
            </h3>
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {item.version}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {item.description}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <StatusBadge status={item.status} />
            {item.status === "planned" && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Not implemented yet
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [version, setVersion] = useState<VersionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [h, v] = await Promise.all([checkHealth(), getVersion()]);
        setHealth(h);
        setVersion(v);
      } catch (error) {
        console.error("Failed to fetch health/version:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusIcon = (status: HealthResponse["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "unhealthy":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />;
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
        return loading ? "Checking..." : "Unknown";
    }
  };

  const getDbStatusIcon = (status: HealthResponse["database"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "unhealthy":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          NEXUS V0.1 — Running foundation. Core backend and frontend are
          operational.
        </p>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                API Status
              </p>
              <div className="flex items-center gap-2">
                {getStatusIcon(health?.status || "unknown")}
                <span className="font-medium text-gray-900 dark:text-white">
                  {getStatusText(health?.status || "unknown")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Database
              </p>
              <div className="flex items-center gap-2">
                {getDbStatusIcon(health?.database || "unknown")}
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {health?.database || "unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Box className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Version
              </p>
              <span className="font-medium text-gray-900 dark:text-white font-mono">
                {version?.version || health?.version || "unknown"}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Server className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Environment
              </p>
              <span className="font-medium text-gray-900 dark:text-white font-mono text-xs">
                Development
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Feature Status
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          The following features are planned for future versions. V0.1 provides
          only the foundation: health endpoint, database migrations, and this UI
          shell.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureItems.map((item) => (
            <FeatureCard key={item.path} item={item} />
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="card p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Information
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-600 dark:text-gray-400">Backend</dt>
            <dd className="font-mono text-gray-900 dark:text-white">
              FastAPI + SQLAlchemy 2.x + SQLite
            </dd>
          </div>
          <div>
            <dt className="text-gray-600 dark:text-gray-400">Frontend</dt>
            <dd className="font-mono text-gray-900 dark:text-white">
              React 18 + TypeScript + Vite + Tailwind
            </dd>
          </div>
          <div>
            <dt className="text-gray-600 dark:text-gray-400">Database</dt>
            <dd className="font-mono text-gray-900 dark:text-white">
              SQLite (WAL mode, foreign keys enabled)
            </dd>
          </div>
          <div>
            <dt className="text-gray-600 dark:text-gray-400">Migrations</dt>
            <dd className="font-mono text-gray-900 dark:text-white">Alembic</dd>
          </div>
          <div>
            <dt className="text-gray-600 dark:text-gray-400">API Binding</dt>
            <dd className="font-mono text-gray-900 dark:text-white">
              127.0.0.1:8000 (loopback only)
            </dd>
          </div>
          <div>
            <dt className="text-gray-600 dark:text-gray-400">
              Frontend Dev Server
            </dt>
            <dd className="font-mono text-gray-900 dark:text-white">
              127.0.0.1:5173 (Vite proxy to API)
            </dd>
          </div>
          <div>
            <dt className="text-gray-600 dark:text-gray-400">Data Directory</dt>
            <dd className="font-mono text-gray-900 dark:text-white text-xs">
              %LOCALAPPDATA%\NEXUS\
            </dd>
          </div>
          <div>
            <dt className="text-gray-600 dark:text-gray-400">Security</dt>
            <dd className="font-mono text-gray-900 dark:text-white">
              CORS restricted, Host/Origin validation
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
