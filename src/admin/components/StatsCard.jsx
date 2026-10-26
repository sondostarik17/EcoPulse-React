export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  color = "green",
}) {
  const colors = {
    green: "bg-emerald-400/10 text-emerald-300",
    amber: "bg-amber-400/10 text-amber-300",
    blue: "bg-blue-400/10 text-blue-300",
    red: "bg-red-400/10 text-red-300",
    purple: "bg-purple-400/10 text-purple-300",
  };

  return (
    <article className="group rounded-2xl border border-white/[0.07] bg-[#0D110F] p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/20 hover:bg-[#101612] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-400">
            {title}
          </p>

          <p className="mt-4 break-words text-3xl font-black tracking-tight text-white sm:text-4xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            colors[color] || colors.green
          }`}
        >
          {Icon && <Icon size={21} />}
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-gray-500">
        {description}
      </p>
    </article>
  );
}