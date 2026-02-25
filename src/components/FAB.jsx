import { useState } from 'react';
import { Plus, UserPlus, MapPin, TreePine, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FAB({ options }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const defaultOptions = options || [
    { label: 'New Client', icon: UserPlus, to: '/clients/new' },
    { label: 'New Property', icon: MapPin, to: '/properties/new' },
    { label: 'Tree Inventory', icon: TreePine, to: '/properties' },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2">
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="relative z-40 flex flex-col items-end gap-2 mb-1">
            {defaultOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  setOpen(false);
                  if (opt.onClick) opt.onClick();
                  else navigate(opt.to);
                }}
                className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2.5 rounded-full shadow-lg border border-gray-200 font-medium text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors whitespace-nowrap"
              >
                <opt.icon className="w-4 h-4 text-green-600" />
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        className="w-14 h-14 rounded-full bg-green-600 text-white shadow-xl flex items-center justify-center hover:bg-green-700 active:bg-green-800 transition-all z-40"
        style={{ boxShadow: '0 4px 20px rgba(22,163,74,0.4)' }}
      >
        {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
}
