import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Navigation, FileText, StickyNote, TreePine, Plus,
  Phone, Mail, ChevronRight, Camera, Edit2, CheckCircle, XCircle,
  Clock, User, Clipboard, Pencil, Check, X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import FAB from '../components/FAB';
import { format, parseISO } from 'date-fns';
import { TREE_RATINGS } from '../data/defaults';

// ─── Tree Card ─────────────────────────────────────────────────────────────
function TreeCard({ tree, onEdit }) {
  const rating = TREE_RATINGS.find(r => r.value === tree.rating);
  const hasNotes = tree.notes?.trim();
  const hasPhotos = tree.photos?.length > 0;

  return (
    <div
      onClick={() => onEdit(tree)}
      className="card hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm
          ${hasNotes || hasPhotos ? 'ring-2 ring-yellow-400' : ''} bg-green-100 text-green-700`}>
          {tree.treeNumber || '?'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm">{tree.species || 'Unknown Species'}</p>
            {rating && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                ${rating.color === 'green' ? 'bg-green-100 text-green-700' :
                  rating.color === 'lime' ? 'bg-lime-100 text-lime-700' :
                  rating.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                  rating.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                  rating.color === 'red' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'}`}>
                {rating.label}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">DBH: {tree.dbh || 'N/A'}</p>
          {tree.treatments?.length > 0 && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              {tree.treatments.length} treatment{tree.treatments.length > 1 ? 's' : ''} · ${tree.treatments.reduce((s, t) => s + (t.price || 0), 0).toLocaleString()}
            </p>
          )}
          {(hasNotes || hasPhotos) && (
            <div className="flex gap-2 mt-1">
              {hasPhotos && <span className="text-xs text-blue-500 flex items-center gap-0.5"><Camera className="w-3 h-3" />{tree.photos.length}</span>}
              {hasNotes && <span className="text-xs text-yellow-600">Has notes</span>}
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
      </div>
    </div>
  );
}

// ─── Schedule Modal ────────────────────────────────────────────────────────
function ScheduleModal({ job, property, onClose }) {
  const { state, actions, selectors } = useApp();
  const [form, setForm] = useState({
    assignedTo: job?.assignedTo || '',
    scheduledDate: job?.scheduledDate || '',
    status: job?.status || 'estimate_scheduled',
  });

  const estimators = state.users.filter(u => ['estimator', 'crew_leader', 'admin'].includes(u.role));

  const handleSave = () => {
    if (!job) return;
    actions.updateJob({ ...job, ...form });
    if (form.status === 'scheduled') {
      actions.addAlert(`Job at ${property.propertyName || property.address} scheduled for ${form.scheduledDate}`, 'schedule');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Schedule Job</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="label">Assign To</label>
            <select className="select" value={form.assignedTo} onChange={e => setForm(f => ({...f, assignedTo: e.target.value}))}>
              <option value="">Unassigned</option>
              {state.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={form.scheduledDate}
              onChange={e => setForm(f => ({...f, scheduledDate: e.target.value}))} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="select" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
              <option value="estimate_scheduled">Estimate Scheduled</option>
              <option value="scheduled">Job Scheduled</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>
        </div>
        <div className="p-4 flex gap-3 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} className="btn-primary flex-1">Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Job Completion Modal ──────────────────────────────────────────────────
function JobCompletionModal({ job, onClose }) {
  const { actions } = useApp();
  const [form, setForm] = useState({
    hoursWorked: '',
    walkthroughDone: false,
    qcDone: false,
    clientPresent: false,
    requestReview: false,
    notes: '',
  });

  const toggle = (key) => setForm(f => ({ ...f, [key]: !f[key] }));

  const handleComplete = () => {
    actions.updateJob({
      ...job,
      status: 'completed',
      completedAt: new Date().toISOString(),
      completionData: form,
    });
    actions.addAlert(`Job completed: ${job.id}`, 'completion');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Mark Job Complete</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="label">Hours Worked</label>
            <input type="number" className="input" value={form.hoursWorked}
              onChange={e => setForm(f => ({...f, hoursWorked: e.target.value}))}
              placeholder="e.g. 4.5" min="0" step="0.5" />
          </div>

          {[
            { key: 'walkthroughDone', label: 'Walkthrough completed' },
            { key: 'qcDone', label: 'Quality control check done' },
            { key: 'clientPresent', label: 'Client present / signed off' },
            { key: 'requestReview', label: 'Request client review' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => toggle(key)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  form[key] ? 'bg-green-600 border-green-600' : 'border-gray-300'
                }`}
              >
                {form[key] && <CheckCircle className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}

          <div>
            <label className="label">Job Notes</label>
            <textarea className="input" rows={3} value={form.notes}
              onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              placeholder="Any notes about the job..." />
          </div>
        </div>
        <div className="p-4 flex gap-3 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleComplete} className="btn-primary flex-1">Mark Complete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Property Detail Page ──────────────────────────────────────────────────
export default function PropertyDetail() {
  const { id } = useParams();
  const { selectors, actions, state } = useApp();
  const navigate = useNavigate();

  const [showSchedule, setShowSchedule] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({});
  const [addressErrors, setAddressErrors] = useState({});

  const property = selectors.getPropertyById(id);
  const client = property ? selectors.getClientById(property.clientId) : null;
  const jobs = property ? selectors.getJobsForProperty(id) : [];
  const activeJob = jobs.find(j => !['completed', 'invoiced'].includes(j.status));
  const proposals = selectors.getProposalsForProperty(id);
  const assignee = activeJob ? selectors.getUserById(activeJob.assignedTo) : null;

  if (!property) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Property not found.</p>
      <button onClick={() => navigate('/properties')} className="mt-4 btn-secondary">← Back</button>
    </div>
  );

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${property.address}, ${property.city}, ${property.state} ${property.zip}`)}`;

  const handleNotesEdit = () => {
    setNotesDraft(property.notes || '');
    setShowNotes(true);
  };

  const handleNotesSave = () => {
    actions.updateProperty({ ...property, notes: notesDraft });
    setShowNotes(false);
  };

  const startAddressEdit = () => {
    setAddressForm({
      propertyName: property.propertyName || '',
      address: property.address || '',
      city: property.city || '',
      state: property.state || '',
      zip: property.zip || '',
    });
    setAddressErrors({});
    setEditingAddress(true);
  };

  const cancelAddressEdit = () => {
    setEditingAddress(false);
    setAddressErrors({});
  };

  const saveAddress = () => {
    const e = {};
    if (!addressForm.address.trim()) e.address = 'Required';
    if (!addressForm.city.trim())    e.city    = 'Required';
    if (!addressForm.state)          e.state   = 'Required';
    if (!addressForm.zip.trim())     e.zip     = 'Required';
    if (Object.keys(e).length) { setAddressErrors(e); return; }
    actions.updateProperty({ ...property, ...addressForm });
    setEditingAddress(false);
  };

  const setAddr = (k, v) => setAddressForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <button onClick={() => navigate('/properties')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Properties
      </button>

      {/* Property header */}
      <div className="card mb-3">
        {editingAddress ? (
          <div>
            <div className="mb-3">
              <label className="label">Property Name</label>
              <input className="input" value={addressForm.propertyName}
                onChange={e => setAddr('propertyName', e.target.value)} placeholder="e.g. Main Residence" />
            </div>
            <div className="mb-3">
              <label className="label">Street Address *</label>
              <input className={`input ${addressErrors.address ? 'border-red-400' : ''}`}
                value={addressForm.address} onChange={e => setAddr('address', e.target.value)} placeholder="123 Main St" />
              {addressErrors.address && <p className="text-xs text-red-500 mt-1">{addressErrors.address}</p>}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="label">City *</label>
                <input className={`input ${addressErrors.city ? 'border-red-400' : ''}`}
                  value={addressForm.city} onChange={e => setAddr('city', e.target.value)} placeholder="Portland" />
                {addressErrors.city && <p className="text-xs text-red-500 mt-1">{addressErrors.city}</p>}
              </div>
              <div>
                <label className="label">State *</label>
                <select className={`select ${addressErrors.state ? 'border-red-400' : ''}`}
                  value={addressForm.state} onChange={e => setAddr('state', e.target.value)}>
                  <option value="">Select...</option>
                  {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN',
                    'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV',
                    'NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN',
                    'TX','UT','VT','VA','WA','WV','WI','WY'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {addressErrors.state && <p className="text-xs text-red-500 mt-1">{addressErrors.state}</p>}
              </div>
              <div>
                <label className="label">ZIP *</label>
                <input className={`input ${addressErrors.zip ? 'border-red-400' : ''}`}
                  value={addressForm.zip} onChange={e => setAddr('zip', e.target.value)} maxLength={10} placeholder="97201" />
                {addressErrors.zip && <p className="text-xs text-red-500 mt-1">{addressErrors.zip}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveAddress} className="btn-primary flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Save
              </button>
              <button onClick={cancelAddressEdit} className="btn-secondary flex items-center gap-1.5">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-lg font-bold">{property.propertyName || property.address}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{property.address}, {property.city}, {property.state} {property.zip}</p>
              </div>
              <button
                onClick={startAddressEdit}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 font-medium flex-shrink-0 ml-3"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
            </div>
            {client && (
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => navigate(`/clients/${client.id}`)}
                  className="text-sm text-green-700 font-medium hover:underline"
                >
                  {client.firstName} {client.lastName}
                </button>
                {client.phone && (
                  <a href={`tel:${client.phone}`} className="text-sm text-gray-500 flex items-center gap-1 hover:text-green-700">
                    <Phone className="w-3 h-3" /> {client.phone}
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="card flex flex-col items-center gap-1.5 py-3 hover:shadow-md transition-shadow text-center"
        >
          <Navigation className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-medium text-gray-700">Directions</span>
        </a>
        <button
          onClick={() => navigate(`/proposals/new?propertyId=${id}`)}
          className="card flex flex-col items-center gap-1.5 py-3 hover:shadow-md transition-shadow"
        >
          <FileText className="w-5 h-5 text-green-600" />
          <span className="text-xs font-medium text-gray-700">Proposal</span>
        </button>
        <button
          onClick={handleNotesEdit}
          className="card flex flex-col items-center gap-1.5 py-3 hover:shadow-md transition-shadow"
        >
          <StickyNote className="w-5 h-5 text-yellow-500" />
          <span className="text-xs font-medium text-gray-700">Notes</span>
        </button>
      </div>

      {/* Notes preview */}
      {property.notes && (
        <div className="card mb-4 bg-yellow-50 border-yellow-100">
          <p className="text-xs font-medium text-yellow-700 mb-1">Property Notes</p>
          <p className="text-sm text-yellow-900">{property.notes}</p>
        </div>
      )}

      {/* Active job status */}
      {activeJob && (
        <div className="card mb-4 border-green-100 bg-green-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Active Job</p>
            <StatusBadge status={activeJob.status} />
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            {activeJob.scheduledDate && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {format(parseISO(activeJob.scheduledDate), 'MMM d, yyyy')}
              </span>
            )}
            {assignee && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {assignee.name}
              </span>
            )}
            {activeJob.estimateTotal > 0 && (
              <span className="font-medium text-green-700">${activeJob.estimateTotal.toLocaleString()}</span>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setShowSchedule(true)} className="btn-secondary text-xs py-1.5 flex-1">
              Schedule / Edit
            </button>
            {activeJob.status !== 'completed' && (
              <button onClick={() => setShowComplete(true)} className="btn-primary text-xs py-1.5 flex-1">
                Mark Complete
              </button>
            )}
          </div>
        </div>
      )}

      {!activeJob && (
        <div className="mb-4">
          <button
            onClick={() => {
              actions.addJob({
                clientId: property.clientId,
                propertyId: id,
                status: 'lead',
                assignedTo: null,
                scheduledDate: null,
                estimateTotal: 0,
                notes: '',
              });
            }}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New Job
          </button>
        </div>
      )}

      {/* Trees section */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <TreePine className="w-4 h-4 text-green-600" />
          Trees ({property.trees?.length || 0})
        </h2>
        <button
          onClick={() => navigate(`/trees/new?propertyId=${id}`)}
          className="text-sm text-green-600 font-medium flex items-center gap-1 hover:underline"
        >
          <Plus className="w-4 h-4" /> Add Tree
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {!property.trees?.length ? (
          <div className="card text-center py-8">
            <TreePine className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No trees added yet</p>
            <button
              onClick={() => navigate(`/trees/new?propertyId=${id}`)}
              className="mt-3 text-green-600 text-sm font-medium hover:underline"
            >
              Add your first tree →
            </button>
          </div>
        ) : (
          property.trees.map(tree => (
            <TreeCard
              key={tree.id}
              tree={tree}
              onEdit={(t) => navigate(`/trees/${t.id}?propertyId=${id}`)}
            />
          ))
        )}
      </div>

      {/* Proposals */}
      {proposals.length > 0 && (
        <div className="mb-4">
          <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            Proposals ({proposals.length})
          </h2>
          <div className="space-y-2">
            {proposals.map(prop => (
              <div
                key={prop.id}
                onClick={() => navigate(`/proposals/${prop.id}`)}
                className="card hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{prop.name}</p>
                  <p className="text-xs text-gray-500">
                    {prop.trees?.length || 0} trees · ${prop.trees?.reduce((s, t) => s + t.treatments?.reduce((ts, tr) => ts + (tr.price || 0), 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={prop.status || 'estimate_sent'} />
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <FAB options={[
        { label: 'Add Tree', icon: TreePine, to: `/trees/new?propertyId=${id}` },
        { label: 'Create Proposal', icon: FileText, to: `/proposals/new?propertyId=${id}` },
        { label: 'Schedule', icon: Clock, onClick: () => setShowSchedule(true) },
      ]} />

      {/* Modals */}
      {showSchedule && activeJob && (
        <ScheduleModal job={activeJob} property={property} onClose={() => setShowSchedule(false)} />
      )}
      {showComplete && activeJob && (
        <JobCompletionModal job={activeJob} onClose={() => setShowComplete(false)} />
      )}

      {/* Notes modal */}
      {showNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold">Property Notes</h3>
            </div>
            <div className="p-4">
              <textarea
                className="input"
                rows={6}
                value={notesDraft}
                onChange={e => setNotesDraft(e.target.value)}
                placeholder="Gate code, access instructions, hazards, special notes..."
              />
            </div>
            <div className="p-4 flex gap-3 border-t border-gray-100">
              <button onClick={() => setShowNotes(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleNotesSave} className="btn-primary flex-1">Save Notes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
