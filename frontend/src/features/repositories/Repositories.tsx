// Repositories Feature — V0.1 placeholder
import { GitBranch, Plus, Search, Filter, ChevronDown } from "lucide-react";

export function Repositories() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Repositories
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add public repos, fetch metadata/README, categorize, link to
            projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Repository
          </button>
        </div>
      </div>

      <div className="card">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search repositories..."
                className="input pl-10"
                disabled
              />
            </div>
            <div className="flex items-center gap-2">
              <select className="input w-auto" disabled>
                <option>All Statuses</option>
              </select>
              <button
                className="btn-secondary flex items-center gap-1"
                disabled
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 text-center">
          <GitBranch className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Repository Library not implemented yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            This feature is planned for V0.3. Requires V0.2 (resource catalog,
            categories, tags) as a dependency.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Planned for V0.3
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
