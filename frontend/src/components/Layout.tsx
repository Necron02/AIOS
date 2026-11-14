// NEXUS Layout Component
// V0.0 scaffold — not implemented yet

import { NavLink } from "react-router-dom";
import { clsx } from "clsx";

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/projects", label: "Projects" },
  { path: "/repositories", label: "Repositories" },
  { path: "/skills", label: "Skills" },
  { path: "/mcp", label: "MCP" },
  { path: "/applications", label: "Applications" },
  { path: "/system", label: "System" },
  { path: "/activity", label: "Activity" },
  { path: "/settings", label: "Settings" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">NEXUS</h1>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      clsx(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              v0.0.0 (scaffold)
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}