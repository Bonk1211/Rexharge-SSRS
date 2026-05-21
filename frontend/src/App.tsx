import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import TopBar from "@/components/chrome/TopBar";
import DemoDialog from "@/components/chrome/DemoDialog";
import { useShortcuts } from "@/lib/use-shortcuts";
import { useDemoDialog } from "@/store/demo-dialog-store";

export default function App() {
  useShortcuts();
  const open = useDemoDialog((s) => s.open);
  const closeDialog = useDemoDialog((s) => s.closeDialog);
  return (
    <div className="min-h-screen bg-paper-grain text-ink flex flex-col">
      <TopBar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Outlet />
      </div>
      <DemoDialog open={open} onClose={closeDialog} />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
