import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, ChevronRight, Plus, Pencil, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import { format, parseISO } from 'date-fns';

export default function ClientDetail() {
  const { id } = useParams();
  const { selectors, actions } = useApp();
  const navigate = useNavigate();

  const client = selectors.getClientById(id);
  const properties = selectors.getPropertiesForClient(id);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  if (!client) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Client not found.</p>
      <button onClick={() => navigate('/clients')} className="mt-4 btn-secondary">← Back</button>
    </div>
  );

  const startEdit = () => {
    setForm({
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone || '',
      email: client.email || '',
    });
    setErrors({});
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setErrors({});
  };

  const saveEdit = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim())  e.lastName  = 'Required';
    if (!form.phone.trim())     e.phone     = 'Required';
    if (Object.keys(e).length) { setErrors(e); return; }
    actions.updateClient({ ...client, ...form });
    setEditing(false);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <button onClick={() => navigate('/clients')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Clients
      </button>

      {/* Client header */}
      <div className="card mb-4">
        {editing ? (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="label">First Name *</label>
                <input
                  className={`input ${errors.firstName ? 'border-red-400' : ''}`}
                  value={form.firstName}
                  onChange={e => set('firstName', e.target.value)}
                  placeholder="First name"
                />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input
                  className={`input ${errors.lastName ? 'border-red-400' : ''}`}
                  value={form.lastName}
                  onChange={e => set('lastName', e.target.value)}
                  placeholder="Last name"
                />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>
            </div>
            <div className="mb-3">
              <label className="label">Phone *</label>
              <input
                className={`input ${errors.phone ? 'border-red-400' : ''}`}
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="(555) 000-0000"
                type="tel"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div className="mb-4">
              <label className="label">Email</label>
              <input
                className="input"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="email@example.com"
                type="email"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={saveEdit} className="btn-primary flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Save
              </button>
              <button onClick={cancelEdit} className="btn-secondary flex items-center gap-1.5">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-lg">
                  {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-lg font-bold">{client.firstName} {client.lastName}</h1>
                  <p className="text-xs text-gray-400">Client since {format(parseISO(client.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 font-medium"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
            </div>
            <div className="space-y-2">
              {client.phone && (
                <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-700">
                  <Phone className="w-4 h-4 text-gray-400" /> {client.phone}
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-700">
                  <Mail className="w-4 h-4 text-gray-400" /> {client.email}
                </a>
              )}
              {!client.phone && !client.email && (
                <p className="text-sm text-gray-400 italic">No contact info — tap Edit to add.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Properties */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800">Properties</h2>
        <button
          onClick={() => navigate(`/properties/new?clientId=${id}`)}
          className="text-sm text-green-600 font-medium flex items-center gap-1 hover:underline"
        >
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>

      <div className="space-y-2">
        {properties.length === 0 ? (
          <div className="card text-center py-8">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No properties yet</p>
          </div>
        ) : (
          properties.map(prop => {
            const jobs = selectors.getJobsForProperty(prop.id);
            const activeJob = jobs.find(j => !['completed', 'invoiced'].includes(j.status));
            return (
              <div
                key={prop.id}
                onClick={() => navigate(`/properties/${prop.id}`)}
                className="card hover:shadow-md transition-shadow cursor-pointer flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{prop.propertyName || prop.address}</p>
                  <p className="text-xs text-gray-500 truncate">{prop.address}, {prop.city}, {prop.state}</p>
                  {activeJob && (
                    <div className="mt-1">
                      <StatusBadge status={activeJob.status} />
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
