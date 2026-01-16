import React from 'react';

// --- Icons ---

export const Icons = {
  Settings: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  Chart: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  Globe: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  )
};

// --- Sidebar Tab Button (SaaS Style) ---
export const SidebarTab: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  collapsed?: boolean;
}> = ({ label, active, onClick, icon, collapsed }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`flex-1 py-3 text-[11px] font-semibold uppercase tracking-wider transition-all border-b-[2px] flex items-center justify-center
      ${active
        ? 'border-slate-900 text-slate-900 bg-slate-50'
        : 'border-transparent text-slate-400 hover:text-slate-800 hover:bg-slate-50'
      }`}
  >
    <span className={`${collapsed ? '' : 'mr-2'} opacity-80`}>{icon}</span>
    {!collapsed && label}
  </button>
);

// --- Section Heading (SaaS Style) ---
export const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-2 mb-3 mt-5 px-1">
    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
      {title}
    </h3>
    <div className="h-[1px] bg-slate-100 w-full"></div>
  </div>
);


// --- Stat Row (Data Table Style) ---
interface StatRowProps {
  label: string;
  value: string | number;
  subValue?: string;
}

export const StatRow: React.FC<StatRowProps> = ({ label, value, subValue }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 px-1 hover:bg-slate-50 transition-colors">
    <span className="text-[11px] text-slate-500 font-medium">{label}</span>
    <div className="text-right">
      <div className="text-xs font-semibold text-slate-900 font-mono tracking-tight">{value}</div>
      {subValue && <div className="text-[9px] text-slate-400">{subValue}</div>}
    </div>
  </div>
);

// --- Dropdown (Minimal Input) ---
interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

export const Dropdown: React.FC<DropdownProps> = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-1 mb-4">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">
      {label}
    </label>
    <div className="relative group">
      <select
        className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-[11px] font-medium py-2 px-2.5 pr-8
                   focus:outline-none focus:border-slate-400 focus:ring-0 transition-colors cursor-pointer rounded-none"
        {...props}
      >
        <option value="All">All {label === 'Agency' ? 'Agencies' : `${label}s`}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 group-hover:text-slate-600">
        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  </div>
);

// --- Toggle / Radio (Segmented Control) ---
interface RadioGroupProps {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ label, options, value, onChange }) => (
  <div className="mb-4">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-0.5">
      {label}
    </label>
    <div className="flex border border-slate-200 bg-slate-50">
      {options.map((opt, idx) => {
        const isActive = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex-1 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-all
              ${isActive
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5 z-10'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}
              ${idx !== 0 && !isActive ? 'border-l border-slate-200' : ''}
              `}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);