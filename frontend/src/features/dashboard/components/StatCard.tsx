interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  bg: string;
  color: string;
}

export function StatCard({ title, value, icon: Icon, bg, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-semibold text-[#2E2E38]">{value}</p>
        </div>
        <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}