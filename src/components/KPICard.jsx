

export default function KPICard({ title, value, subtitle, icon: Icon, color = 'brand' }) {
    const colorMap = {
        brand: { bg: 'bg-brand-50', icon: 'text-brand-600', val: 'text-brand-700' },
        emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', val: 'text-emerald-700' },
        amber: { bg: 'bg-amber-50', icon: 'text-amber-600', val: 'text-amber-700' },
        red: { bg: 'bg-red-50', icon: 'text-red-600', val: 'text-red-700' },
        blue: { bg: 'bg-blue-50', icon: 'text-blue-600', val: 'text-blue-700' },
        violet: { bg: 'bg-violet-50', icon: 'text-violet-600', val: 'text-violet-700' },
    };
    const c = colorMap[color] ?? colorMap.brand;

    return (
        <div className="card flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
            {Icon && (
                <div className={`${c.bg} p-3 rounded-xl shrink-0`}>
                    <Icon size={22} className={c.icon} />
                </div>
            )}
            <div className="min-w-0">
                <p className="text-sm text-gray-500 truncate">{title}</p>
                <p className={`text-2xl font-bold mt-0.5 ${c.val}`}>{value}</p>
                {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
}
