import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import FeatureRail from "@/components/chrome/FeatureRail";
import TopBar from "@/components/chrome/TopBar";
import { useShortcuts } from "@/lib/use-shortcuts";

export default function App() {
  useShortcuts();
  return (
    <div className="min-h-screen bg-paper-grain text-ink flex">
      <FeatureRail />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <Outlet />
      </div>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
