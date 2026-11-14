// NEXUS Root App Component
// V0.0 scaffold — not implemented yet

import { Routes, Route } from "react-router-dom";
import { Dashboard } from "../features/dashboard/Dashboard";
import { Projects } from "../features/projects/Projects";
import { Repositories } from "../features/repositories/Repositories";
import { Skills } from "../features/skills/Skills";
import { MCP } from "../features/mcp/MCP";
import { Applications } from "../features/applications/Applications";
import { SystemExplorer } from "../features/system-explorer/SystemExplorer";
import { Activity } from "../features/activity/Activity";
import { Settings } from "../features/settings/Settings";
import { Layout } from "../components/Layout";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/mcp" element={<MCP />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/system" element={<SystemExplorer />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;