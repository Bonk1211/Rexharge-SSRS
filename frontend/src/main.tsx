import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import Dashboard from "./pages/Dashboard";
import Workspace3DConverter from "./pages/Workspace3DConverter";
import Analysis from "./pages/Analysis";
import NewProject from "./pages/NewProject";
import Report from "./pages/Report.stub";
import Settings from "./pages/Settings.stub";
import Captures from "./pages/Captures.stub";
import Reports from "./pages/Reports.stub";
import Tariffs from "./pages/Tariffs.stub";
import Portfolio from "./pages/Portfolio.stub";
import Help from "./pages/Help.stub";
import "./styles/globals.css";

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="workspace/3d-converter" element={<Workspace3DConverter />} />
          <Route path="captures" element={<Captures />} />
          <Route path="reports" element={<Reports />} />
          <Route path="tariffs" element={<Tariffs />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="help" element={<Help />} />
          <Route path="settings" element={<Settings />} />
          <Route path="projects/:id/analysis" element={<Analysis />} />
          <Route path="projects/new/*" element={<NewProject />} />
          <Route path="projects/:id/report" element={<Report />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
