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
    navigate("/app");
  }, [navigate]);

  return (
    <div className="bg-paper-grain" style={{ minHeight: "100vh" }}>
      <LandingNav onTryClick={onTryClick} />
      <main>
        <Hero onTryClick={onTryClick} />
        <StatBand />
        <Features />
        <HowItWorks />
        <Closing onTryClick={onTryClick} />
      </main>
    </div>
  );
}
