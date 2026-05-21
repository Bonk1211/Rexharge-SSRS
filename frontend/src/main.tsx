import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import Landing from "./pages/Landing";
import Monitoring from "./pages/Monitoring";
import Clients from "./pages/Clients";
import ProjectDetail from "./pages/ProjectDetail";
import NewProject from "./pages/NewProject";
import Workspace3DConverter from "./pages/Workspace3DConverter";
import Report from "./pages/Report.stub";
import "./styles/globals.css";

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<App />}>
          <Route index element={<Monitoring />} />
          <Route path="clients" element={<Clients />} />
          <Route path="projects/new/*" element={<NewProject />} />
          <Route path="workspace/3d-converter" element={<Workspace3DConverter />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/report" element={<Report />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
