interface Stat {
  value: string;
  label: string;
}

const STATS: Stat[] = [
  { value: '500+', label: 'lives réalisés' },
  { value: '150+', label: 'vendeurs actifs' },
  { value: '98%', label: 'satisfaction client' },
  { value: '2 min', label: "temps d'assignation moyen" },
];

export function StatsSection() {
  return (
    <section className="py-20 bg-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              <span className="text-4xl sm:text-5xl font-bold">{stat.value}</span>
              <span className="text-indigo-200 text-sm sm:text-base">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
