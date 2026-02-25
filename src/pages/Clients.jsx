import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Phone, Mail, Plus, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { US_STATES } from '../data/defaults';

// ─── New Client Form (2-step) ──────────────────────────────────────────────
export function NewClientForm({ onSave, onCancel }) {
  const { actions } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [propForm, setPropForm] = useState({ propertyName: '', address: '', city: '', state: '', zip: '' });
  const [step, setStep] = useState(1);
  const [savedClient, setSavedClient] = useState(null);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setProp = (k, v) => setPropForm(f => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim())  e.lastName  = 'Required';
    if (!form.phone.trim())     e.phone     = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!propForm.address.trim()) e.address = 'Required';
    if (!propForm.city.trim())    e.city    = 'Required';
    if (!propForm.state)          e.state   = 'Required';
    if (!propForm.zip.trim())     e.zip     = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStep1 = () => {
    if (!validateStep1()) return;
    const client = actions.addClient(form);
    setSavedClient(client);
    setStep(2);
    setErrors({});
  };

  const handleStep2 = () => {
    if (!validateStep2()) return;
    const property = actions.addProperty({
      ...propForm,
      clientId: savedClient.id,
      propertyName: propForm.propertyName || `${savedClient.firstName} ${savedClient.lastName} Property`,
      notes: '',
    });
    actions.addJob({
      clientId: savedClient.id,
      propertyId: property.id,
      status: 'lead',
      assignedTo: null,
      scheduledDate: null,
      estimateTotal: 0,
      notes: '',
    });
    if (onSave) onSave(savedClient, property);
    else navigate(`/properties/${property.id}`);
  };

  return (
    <div className="max-w-2xl">
      {/* Step indicators */}
      <div className="flex items-center gap-4 mb-8">
        {['Client Info', 'Property Details'].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              step > i + 1  ? 'bg-green-600 text-white' :
              step === i + 1 ? 'bg-green-600 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>{i + 1}</div>
            <span className={`font-medium text-sm ${step === i + 1 ? 'text-green-700' : 'text-gray-400'}`}>{label}</span>
            {i < 1 && <div className="w-12 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input className={`input ${errors.firstName ? 'border-red-400' : ''}`}
                value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="James" />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input className={`input ${errors.lastName ? 'border-red-400' : ''}`}
                value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Harrington" />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone *</label>
              <input className={`input ${errors.phone ? 'border-red-400' : ''}`}
                value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" type="tel" />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="james@example.com" type="email" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            {onCancel && <button onClick={onCancel} className="btn-secondary">Cancel</button>}
            <button onClick={handleStep1} className="btn-primary">Next: Property →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-2.5 text-sm text-green-700 font-medium">
            Client: {savedClient?.firstName} {savedClient?.lastName}
          </div>
          <div>
            <label className="label">Property Name</label>
            <input className="input" value={propForm.propertyName}
              onChange={e => setProp('propertyName', e.target.value)} placeholder="e.g. Harrington Residence" />
          </div>
          <div>
            <label className="label">Street Address *</label>
            <input className={`input ${errors.address ? 'border-red-400' : ''}`}
              value={propForm.address} onChange={e => setProp('address', e.target.value)} placeholder="142 Oakwood Drive" />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="label">City *</label>
              <input className={`input ${errors.city ? 'border-red-400' : ''}`}
                value={propForm.city} onChange={e => setProp('city', e.target.value)} placeholder="Portland" />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="label">State *</label>
              <select className={`select ${errors.state ? 'border-red-400' : ''}`}
                value={propForm.state} onChange={e => setProp('state', e.target.value)}>
                <option value="">Select...</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
            </div>
            <div>
              <label className="label">ZIP Code *</label>
              <input className={`input ${errors.zip ? 'border-red-400' : ''}`}
                value={propForm.zip} onChange={e => setProp('zip', e.target.value)} placeholder="97201" maxLength={10} />
              {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setStep(1); setErrors({}); }} className="btn-secondary">← Back</button>
            <button onClick={handleStep2} className="btn-primary">Save &amp; Open Property</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Clients Page ──────────────────────────────────────────────────────────
export default function Clients() {
  const { state, selectors } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = state.clients.filter(c => {
    const q = search.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  if (showForm) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
            ← Back to Clients
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Client</h1>
        <NewClientForm onCancel={() => setShowForm(false)} onSave={() => setShowForm(false)} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{state.clients.length} total</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="input pl-9" placeholder="Search by name, phone, email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <User className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">{search ? 'No clients match your search' : 'No clients yet'}</p>
            {!search && (
              <button onClick={() => setShowForm(true)} className="mt-3 text-green-600 text-sm font-medium hover:underline">
                Add your first client →
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Phone</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Properties</div>
              <div className="col-span-1" />
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map(client => {
                const props = selectors.getPropertiesForClient(client.id);
                return (
                  <div
                    key={client.id}
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="grid grid-cols-12 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors items-center group"
                  >
                    <div className="col-span-3 flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-xs flex-shrink-0">
                        {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                      </div>
                      <span className="font-semibold text-sm text-gray-900 truncate group-hover:text-green-700 transition-colors">
                        {client.firstName} {client.lastName}
                      </span>
                    </div>
                    <div className="col-span-3 text-sm text-gray-500 flex items-center gap-1.5">
                      {client.phone ? (
                        <><Phone className="w-3.5 h-3.5 text-gray-300" /> {client.phone}</>
                      ) : <span className="text-gray-300 italic text-xs">—</span>}
                    </div>
                    <div className="col-span-3 text-sm text-gray-500 flex items-center gap-1.5 min-w-0">
                      {client.email ? (
                        <><Mail className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                        <span className="truncate">{client.email}</span></>
                      ) : <span className="text-gray-300 italic text-xs">—</span>}
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {props.length} {props.length === 1 ? 'property' : 'properties'}
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
