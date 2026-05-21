import RadialGaugeCard from "./RadialGaugeCard";

interface PortfolioGaugesRowProps {
  pr: number;
  soiling: number;
  capacityFactor: number;
}

export default function PortfolioGaugesRow({
  pr,
  soiling,
  capacityFactor,
}: PortfolioGaugesRowProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <RadialGaugeCard
        label="Performance ratio"
        value={pr}
        accent="leaf"
        hint="PR · weather-adjusted"
      />
      <RadialGaugeCard
        label="Soiling factor"
        value={soiling}
        accent="solar"
        hint="post-monsoon avg"
      />
      <RadialGaugeCard
        label="Capacity factor"
        value={capacityFactor}
        accent="terracotta"
        hint="annual kWh / (kWp·8760)"
      />
    </section>
  );
}
