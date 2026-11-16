// Skills Feature — V0.1 placeholder
import { BookOpen, Plus } from "lucide-react";

export function Skills() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Skills
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Inventory, preview, install, update, uninstall with staging/backups
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </button>
        </div>
      </div>

      <div className="card">
        <div className="p-8 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Skills Manager not implemented yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            This feature is planned for V0.5. Requires V0.4 (system explorer,
            discovery) as a dependency.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Planned for V0.5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
