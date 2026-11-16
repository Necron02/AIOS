// Settings Feature — V0.1 placeholder
import { Settings as SettingsIcon, Save, RefreshCw } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Vault path, scan roots, Claude executable, sync toggle, log level
        </p>
      </div>

      <div className="card">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white">
            Application Settings
          </h3>
        </div>
        <div className="p-5 space-y-6">
          <div>
            <label className="label" htmlFor="dataDir">
              Data Directory
            </label>
            <input
              type="text"
              id="dataDir"
              className="input font-mono text-xs"
              value="%LOCALAPPDATA%\\NEXUS\\"
              readOnly
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Runtime database, logs, and backups. Not in source control.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="dbPath">
              Database Path
            </label>
            <input
              type="text"
              id="dbPath"
              className="input font-mono text-xs"
              value="%LOCALAPPDATA%\\NEXUS\\nexus.db"
              readOnly
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              SQLite database with WAL mode and foreign keys enabled.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="apiUrl">
              API Base URL
            </label>
            <input
              type="text"
              id="apiUrl"
              className="input font-mono text-xs"
              value="http://127.0.0.1:8000"
              readOnly
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Backend binds to 127.0.0.1 only (loopback). Never 0.0.0.0.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="frontendUrl">
              Frontend Dev URL
            </label>
            <input
              type="text"
              id="frontendUrl"
              className="input font-mono text-xs"
              value="http://127.0.0.1:5173"
              readOnly
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Vite dev server with proxy to /api → FastAPI.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Planned Settings (V0.9)
            </h4>
            <dl className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <dt className="text-gray-600 dark:text-gray-400 w-full sm:w-48">
                  Obsidian Vault Path
                </dt>
                <dd>
                  <input
                    type="text"
                    className="input bg-gray-50 dark:bg-gray-700"
                    value="Not configured"
                    readOnly
                  />
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <dt className="text-gray-600 dark:text-gray-400 w-full sm:w-48">
                  Scan Roots
                </dt>
                <dd>
                  <input
                    type="text"
                    className="input bg-gray-50 dark:bg-gray-700"
                    value="Not configured"
                    readOnly
                  />
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <dt className="text-gray-600 dark:text-gray-400 w-full sm:w-48">
                  Claude Executable
                </dt>
                <dd>
                  <input
                    type="text"
                    className="input bg-gray-50 dark:bg-gray-700"
                    value="Auto-detect from PATH"
                    readOnly
                  />
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <dt className="text-gray-600 dark:text-gray-400 w-full sm:w-48">
                  Log Level
                </dt>
                <dd>
                  <input
                    type="text"
                    className="input bg-gray-50 dark:bg-gray-700"
                    value="INFO"
                    readOnly
                  />
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <dt className="text-gray-600 dark:text-gray-400 w-full sm:w-48">
                  Obsidian Sync
                </dt>
                <dd>
                  <input
                    type="text"
                    className="input bg-gray-50 dark:bg-gray-700"
                    value="Disabled"
                    readOnly
                  />
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="card p-5 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <SettingsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-300">
              Settings Management
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
              Full settings UI with validation, persistence, and live effect
              will be implemented in V0.9. Current settings are configured via{" "}
              <code className="font-mono bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded">
                .env
              </code>{" "}
              file and environment variables.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button className="btn-secondary" disabled>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </button>
              <button className="btn-secondary" disabled>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload from .env
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
