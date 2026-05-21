import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import StatBand from "@/components/landing/StatBand";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Closing from "@/components/landing/Closing";

export default function Landing() {
  const navigate = useNavigate();
  const onTryClick = useCallback(() => {
    navigate("/app/workspace/3d-converter");
  }, [navigate]);

  return (
    <div className="bg-paper-grain" style={{ minHeight: "100vh", scrollBehavior: "smooth" }}>
      <LandingNav onTryClick={onTryClick} />
      <main>
        <section id="studio" style={{ scrollMarginTop: 88 }}>
          <Hero onTryClick={onTryClick} />
        </section>
        <section id="yield-model" style={{ scrollMarginTop: 88 }}>
          <StatBand />
        </section>
        <section id="features" style={{ scrollMarginTop: 88 }}>
          <Features />
        </section>
        <section id="how-it-works" style={{ scrollMarginTop: 88 }}>
          <HowItWorks />
        </section>
        <section id="get-started" style={{ scrollMarginTop: 88 }}>
          <Closing onTryClick={onTryClick} />
        </section>
      </main>
    </div>
  );
}
