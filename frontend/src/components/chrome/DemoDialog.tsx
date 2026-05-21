import { useEffect } from "react";
import { X } from "@phosphor-icons/react";

interface DemoDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function DemoDialog({ open, onClose }: DemoDialogProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-dialog-title"
        onClick={(event) => event.stopPropagation()}
        className="relative rounded-2xl bg-surface p-7 max-w-[440px] w-[90vw]"
        style={{
          border: "1px solid var(--rule)",
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.25)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close demo dialog"
          className="absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 rounded-full text-mute hover:text-ink transition-colors"
        >
          <X size={16} weight="bold" />
        </button>

        <span className="mono text-[10.5px] uppercase tracking-[0.24em] text-leaf-deep">
          Demo build
        </span>
        <h2
          id="demo-dialog-title"
          className="numeral text-[24px] tracking-[-0.02em] text-ink mt-2"
          style={{ fontWeight: 600 }}
        >
          Project creation is disabled.
        </h2>
        <p className="mt-3 text-[13.5px] text-mute leading-relaxed">
          This is a demo build. No new project rows are written to the database. Use the seeded sites in Clients and Monitoring to explore the workflow.
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-10 inline-flex items-center gap-2 rounded-full text-[13px] font-bold tracking-tight text-paper"
            style={{ background: "var(--ink)" }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
