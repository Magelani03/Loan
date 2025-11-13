interface StatsCardProps {
  value: string;
  label: string;
}

export const StatsCard = ({ value, label }: StatsCardProps) => {
  return (
    <div className="bg-secondary/80 backdrop-blur-sm rounded-lg p-6 text-center transition-all hover:bg-secondary/90 hover:scale-105">
      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};
