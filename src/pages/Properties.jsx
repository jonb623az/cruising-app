import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, ChevronRight, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import { US_STATES } from '../data/defaults';

// ─── New Property Form ─────────────────────────────────────────────────────
export function NewPropertyForm() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preClientId = searchParams.get('clientId') || '';

  const [form, setForm] = useState({
    clientId: preClientId, propertyName: '', address: '',
    city: '', state: '', zip: '', notes: '',
  });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.clientId)       e.clientId = 'Required';
    if (!form.address.trim()) e.address  = 'Required';
    if (!form.city.trim())    e.city     = 'Required';
    if (!form.state)          e.state    = 'Required';
    if (!form.zip.trim())     e.zip      = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const client = state.clients.find(c => c.id === form.clientId);
    const property = actions.addProperty({
      ...form,
      propertyName: form.propertyName || `${client?.firstName} ${client?.lastName} Property`,
    });
    navigate(`/properties/${property.id}`);
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-sm font-medium mb-6">
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Property</h1>
      <div className="max-w-2xl space-y-5">
        <div>
          <label className="label">Client *</label>
          <select className={`select max-w-sm ${errors.clientId ? 'border-red-400' : ''}`}
            value={form.clientId} onChange={e => set('clientId', e.target.value)}>
            <option value="">Select client...</option>
            {state.clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
          </select>
          {errors.clientId && <p className="text-xs text-red-500 mt-1">{errors.clientId}</p>}
        </div>
        <div>
          <label className="label">Property Name</label>
          <input className="input max-w-sm" value={form.propertyName}
            onChange={e => set('propertyName', e.target.value)} placeholder="e.g. Main Residence" />
        </div>
        <div>
          <label className="label">Street Address *</label>
          <input className={`input ${errors.address ? 'border-red-400' : ''}`}
            value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St" />
          {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">City *</label>
            <input className={`input ${errors.city ? 'border-red-400' : ''}`}
              value={form.city} onChange={e => set('city', e.target.value)} placeholder="Portland" />
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="label">State *</label>
            <select className={`select ${errors.state ? 'border-red-400' : ''}`}
              value={form.state} onChange={e => set('state', e.target.value)}>
              <option value="">Select...</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
          </div>
          <div>
            <label className="label">ZIP Code *</label>
            <input className={`input ${errors.zip ? 'border-red-400' : ''}`}
              value={form.zip} onChange={e => set('zip', e.target.value)} maxLength={10} placeholder="97201" />
            {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip}</p>}
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input" rows={3} value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Gate code, access instructions, special notes..." />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">Save Property</button>
        </div>
      </div>
    </div>
  );
}

// ─── Properties List ───────────────────────────────────────────────────────
export default function Properties() {
  const { state, selectors } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = state.properties.filter(p => {
    const q = search.toLowerCase();
    const client = selectors.getClientById(p.clientId);
    return (
      p.propertyName?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      client?.firstName?.toLowerCase().includes(q) ||
      client?.lastName?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-500 mt-0.5">{state.properties.length} total</p>
        </div>
        <button onClick={() => navigate('/properties/new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Property
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="input pl-9" placeholder="Search properties or clients..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">{search ? 'No properties match' : 'No properties yet'}</p>
            {!search && (
              <button onClick={() => navigate('/properties/new')} className="mt-3 text-green-600 text-sm font-medium hover:underline">
                Add your first property →
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <div className="col-span-3">Property</div>
              <div className="col-span-3">Address</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-2">Trees</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1" />
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map(prop => {
                const client   = selectors.getClientById(prop.clientId);
                const jobs     = selectors.getJobsForProperty(prop.id);
                const activeJob = jobs.find(j => !['completed', 'invoiced'].includes(j.status));
                return (
                  <div
                    key={prop.id}
                    onClick={() => navigate(`/properties/${prop.id}`)}
                    className="grid grid-cols-12 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors items-center group"
                  >
                    <div className="col-span-3 flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-semibold text-sm text-gray-900 truncate group-hover:text-green-700 transition-colors">
                        {prop.propertyName || prop.address}
                      </span>
                    </div>
                    <div className="col-span-3 text-sm text-gray-500 truncate pr-3">
                      {prop.address}, {prop.city}, {prop.state} {prop.zip}
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {client ? `${client.firstName} ${client.lastName}` : '—'}
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {prop.trees?.length || 0} tree{prop.trees?.length !== 1 ? 's' : ''}
                    </div>
                    <div className="col-span-1">
                      {activeJob ? <StatusBadge status={activeJob.status} /> : <span className="text-gray-300 text-xs">—</span>}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
