import { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Lock, DollarSign, TreePine } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { USER_ROLES } from '../data/defaults';

// ─── Treatment Editor ─────────────────────────────────────────────────────
function TreatmentRow({ treatment, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: treatment.name, defaultPrice: treatment.defaultPrice, unit: treatment.unit });

  const handleSave = () => {
    onSave({ ...treatment, ...form, defaultPrice: Number(form.defaultPrice) });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-green-50 rounded-xl p-3 space-y-2">
        <input
          className="input text-sm"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Treatment name"
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Default Price ($)</label>
            <input
              type="number"
              className="input text-sm"
              value={form.defaultPrice}
              onChange={e => setForm(f => ({ ...f, defaultPrice: e.target.value }))}
              min="0"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Unit</label>
            <select
              className="select text-sm"
              value={form.unit}
              onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
            >
              <option value="per tree">per tree</option>
              <option value="per stump">per stump</option>
              <option value="per load">per load</option>
              <option value="per job">per job</option>
              <option value="per hour">per hour</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(false)} className="btn-secondary flex-1 text-sm py-1.5">
            <X className="w-3.5 h-3.5 inline mr-1" /> Cancel
          </button>
          <button onClick={handleSave} className="btn-primary flex-1 text-sm py-1.5">
            <Save className="w-3.5 h-3.5 inline mr-1" /> Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800">{treatment.name}</p>
        <p className="text-xs text-gray-400">
          {treatment.defaultPrice > 0 ? `$${treatment.defaultPrice}` : 'Custom price'} · {treatment.unit}
        </p>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(treatment.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────
export default function Settings() {
  const { state, actions, selectors } = useApp();
  const [addingTreatment, setAddingTreatment] = useState(false);
  const [newTreatment, setNewTreatment] = useState({ name: '', defaultPrice: '', unit: 'per tree' });

  if (!selectors.canManageSettings()) {
    return (
      <div className="text-center py-20">
        <Lock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="font-medium text-gray-500">Access Restricted</p>
        <p className="text-sm text-gray-400 mt-1">Only admins can manage settings.</p>
      </div>
    );
  }

  const handleAddTreatment = () => {
    if (!newTreatment.name.trim()) return;
    actions.addTreatment({
      name: newTreatment.name.trim(),
      defaultPrice: Number(newTreatment.defaultPrice) || 0,
      unit: newTreatment.unit,
    });
    setNewTreatment({ name: '', defaultPrice: '', unit: 'per tree' });
    setAddingTreatment(false);
  };

  const ROLE_LABELS = {
    [USER_ROLES.ADMIN]: 'Admin',
    [USER_ROLES.OFFICE]: 'Office Staff',
    [USER_ROLES.ESTIMATOR]: 'Estimator',
    [USER_ROLES.CREW_LEADER]: 'Crew Leader',
    [USER_ROLES.CREW]: 'Crew Member',
  };

  const ROLE_COLORS = {
    [USER_ROLES.ADMIN]: 'bg-purple-100 text-purple-700',
    [USER_ROLES.OFFICE]: 'bg-blue-100 text-blue-700',
    [USER_ROLES.ESTIMATOR]: 'bg-green-100 text-green-700',
    [USER_ROLES.CREW_LEADER]: 'bg-orange-100 text-orange-700',
    [USER_ROLES.CREW]: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="max-w-lg mx-auto pb-8">
      <h1 className="text-xl font-bold mb-5">Settings</h1>

      {/* Treatment Library */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <TreePine className="w-4 h-4 text-green-600" />
            Treatment Library
          </h2>
          <button
            onClick={() => setAddingTreatment(v => !v)}
            className="text-sm text-green-600 font-medium flex items-center gap-1 hover:underline"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {addingTreatment && (
          <div className="bg-green-50 rounded-xl p-3 mb-3 space-y-2">
            <input
              className="input text-sm"
              value={newTreatment.name}
              onChange={e => setNewTreatment(f => ({ ...f, name: e.target.value }))}
              placeholder="Treatment name"
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Default Price ($)</label>
                <input
                  type="number"
                  className="input text-sm"
                  value={newTreatment.defaultPrice}
                  onChange={e => setNewTreatment(f => ({ ...f, defaultPrice: e.target.value }))}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Unit</label>
                <select
                  className="select text-sm"
                  value={newTreatment.unit}
                  onChange={e => setNewTreatment(f => ({ ...f, unit: e.target.value }))}
                >
                  <option value="per tree">per tree</option>
                  <option value="per stump">per stump</option>
                  <option value="per load">per load</option>
                  <option value="per job">per job</option>
                  <option value="per hour">per hour</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAddingTreatment(false)} className="btn-secondary flex-1 text-sm py-1.5">
                Cancel
              </button>
              <button onClick={handleAddTreatment} className="btn-primary flex-1 text-sm py-1.5">
                Add Treatment
              </button>
            </div>
          </div>
        )}

        <div>
          {state.treatments.map(t => (
            <TreatmentRow
              key={t.id}
              treatment={t}
              onSave={actions.updateTreatment}
              onDelete={actions.deleteTreatment}
            />
          ))}
        </div>
      </div>

      {/* Team Members */}
      <div className="card mb-5">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-blue-500" />
          Team Members
        </h2>
        <div className="space-y-3">
          {state.users.map(user => (
            <div key={user.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Full user management coming in next phase
        </p>
      </div>

      {/* Job Costing Info */}
      <div className="card bg-gray-50">
        <h2 className="font-semibold text-gray-800 mb-2">Job Costing</h2>
        <p className="text-sm text-gray-500">
          Job costing dashboard is visible to Admin, Office Staff, and Crew Leaders only.
          This tracks labor, materials, and equipment costs per job.
        </p>
        <p className="text-xs text-gray-400 mt-2">Full job costing module coming soon.</p>
      </div>
    </div>
  );
}
