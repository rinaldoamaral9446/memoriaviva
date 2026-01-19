import React from 'react';

const StatCard = ({ label, value, icon: Icon, color, subtext }) => {
    // Extract base color name (e.g., 'blue', 'orange') to construct dynamic background classes
    // Assumption: 'color' prop comes as 'text-blue-600', so we extract 'blue'.
    // If 'color' is passed differently, we might need a mapping or just hardcode bg opacity.

    // Simple approach: Use white background for card, and colored background for icon.
    // The 'color' prop will be used directly on the icon and text.

    // Extract dynamic BG class based on text color convention or pass a bg prop.
    // Let's rely on standard tailwind classes or simple opacity if needed.
    // Spec says: "Bg do Ícone: bg-blue-50".

    // Helper to map text color to bg color (rough approximation)
    const getBgColor = (textColorClass) => {
        if (textColorClass.includes('blue')) return 'bg-blue-50';
        if (textColorClass.includes('emerald') || textColorClass.includes('green')) return 'bg-emerald-50';
        if (textColorClass.includes('orange')) return 'bg-orange-50';
        return 'bg-gray-50'; // default
    };

    const bgClass = getBgColor(color);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className={`p-4 rounded-full ${bgClass} shrink-0`}>
                <Icon className={`w-8 h-8 ${color}`} />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{label}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
        </div>
    );
};

export default StatCard;
