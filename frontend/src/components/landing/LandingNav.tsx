import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "@/icons";
import Wordmark from "./Wordmark";

interface LandingNavProps {
  onTryClick: () => void;
}

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Studio", href: "#studio" },
  { label: "Yield model", href: "#yield-model" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Get started", href: "#get-started" },
];

function scrollToAnchor(href: string) {
  const id = href.replace(/^#/, "");
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LandingNav({ onTryClick }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: scrolled ? "rgba(250,250,247,0.86)" : "transparent",
        backdropFilter: scrolled ? "blur(14px) saturate(160%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px) saturate(160%)" : "none",
        borderBottom: scrolled ? "1px solid var(--rule)" : "1px solid transparent",
        transition: "background 200ms ease, border-color 200ms ease",
      }}
    >
      <div
        className="nav-wrapper flex items-center justify-between"
        style={{ maxWidth: 1320, margin: "0 auto", padding: "18px 32px" }}
      >
        <div className="flex items-center" style={{ gap: 32 }}>
          <Wordmark />
        </div>

        <nav className="nav-links hidden md:flex items-center" style={{ gap: 26 }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                scrollToAnchor(href);
                if (history.replaceState) history.replaceState(null, "", href);
              }}
              className="link-dotted"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink-2)",
                textDecorationColor: "transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--leaf-deep)";
                e.currentTarget.style.textDecorationColor = "var(--leaf)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--ink-2)";
                e.currentTarget.style.textDecorationColor = "transparent";
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center" style={{ gap: 12 }}>
          <Link
            to="/app"
            className="hidden sm:inline-flex items-center"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--ink-2)",
              padding: "8px 12px",
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
          <button
            onClick={onTryClick}
            className="inline-flex items-center"
            style={{
              gap: 8,
              padding: "10px 16px 10px 18px",
              background: "var(--ink)",
              color: "var(--paper)",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 800,
              letterSpacing: "-0.005em",
              whiteSpace: "nowrap",
              boxShadow: "0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 18px -8px rgba(26,31,28,0.45)",
              transition: "transform 160ms ease, box-shadow 160ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 1px 0 rgba(255,255,255,0.18) inset, 0 12px 28px -10px rgba(26,31,28,0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 18px -8px rgba(26,31,28,0.45)";
            }}
          >
            Try the studio
            <ArrowUpRight size={13} weight="bold" />
          </button>
        </div>
      </div>
    </header>
  );
}
