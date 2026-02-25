import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera, X, Check, TreePine, AlertTriangle, Zap, Building2, ParkingCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TREE_SPECIES, DBH_RANGES, TREE_RATINGS } from '../data/defaults';

const HARDSCAPE_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'potential', label: 'Potential' },
  { value: 'yes', label: 'Yes' },
];

export default function TreeForm() {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const navigate = useNavigate();
  const { selectors, actions } = useApp();

  const property = selectors.getPropertyById(propertyId);
  const treeNumber = (property?.trees?.length || 0) + 1;

  const [form, setForm] = useState({
    species: '',
    dbh: '',
    rating: '',
    hardscapeDamage: 'no',
    nearPowerlines: false,
    nearBuilding: false,
    noParking: false,
    notes: '',
    photos: [],
    treatments: [],
  });

  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [showTreatments, setShowTreatments] = useState(false);
  const fileInputRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k) => setForm(f => ({ ...f, [k]: !f[k] }));

  // Treatment selection
  const allTreatments = actions ? [] : [];

  const handlePhotoCapture = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(f => ({
          ...f,
          photos: [...f.photos, { url: ev.target.result, caption: '', addedAt: new Date().toISOString() }],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx) => {
    setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));
  };

  const { state } = useApp();
  const treatments = state.treatments;

  const toggleTreatment = (t) => {
    setSelectedTreatments(prev => {
      const exists = prev.find(st => st.id === t.id);
      if (exists) return prev.filter(st => st.id !== t.id);
      return [...prev, { ...t, price: t.defaultPrice }];
    });
  };

  const updatePrice = (id, price) => {
    setSelectedTreatments(prev => prev.map(t => t.id === id ? { ...t, price: Number(price) } : t));
  };

  const handleSave = () => {
    if (!propertyId) return;
    const treeData = { ...form, treeNumber, treatments: selectedTreatments };
    actions.addTreeToProperty(propertyId, treeData);
    navigate(`/properties/${propertyId}`);
  };

  const total = selectedTreatments.reduce((s, t) => s + (t.price || 0), 0);

  return (
    <div className="max-w-lg mx-auto pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> {property?.propertyName || 'Property'}
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
          {treeNumber}
        </div>
        <div>
          <h1 className="text-xl font-bold">New Tree</h1>
          <p className="text-sm text-gray-500">Tree #{treeNumber} · {property?.propertyName}</p>
        </div>
      </div>

      {/* ── Tree Profile ── */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <TreePine className="w-4 h-4 text-green-600" /> Tree Profile
        </h2>
        <div className="space-y-3">
          <div>
            <label className="label">Species</label>
            <select className="select" value={form.species} onChange={e => set('species', e.target.value)}>
              <option value="">Select species...</option>
              {TREE_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">DBH (Diameter at Breast Height)</label>
            <select className="select" value={form.dbh} onChange={e => set('dbh', e.target.value)}>
              <option value="">Select DBH range...</option>
              {DBH_RANGES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Condition Rating</label>
            <div className="grid grid-cols-3 gap-2">
              {TREE_RATINGS.map(r => (
                <button
                  key={r.value}
                  onClick={() => set('rating', r.value)}
                  className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    form.rating === r.value
                      ? `border-${r.color === 'lime' ? 'lime' : r.color}-500 bg-${r.color === 'lime' ? 'lime' : r.color}-50 text-${r.color === 'lime' ? 'lime' : r.color}-700`
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Attributes ── */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500" /> Attributes
        </h2>

        <div className="space-y-3">
          <div>
            <label className="label">Hardscape Damage</label>
            <div className="flex gap-2">
              {HARDSCAPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => set('hardscapeDamage', opt.value)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    form.hardscapeDamage === opt.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {[
              { key: 'nearPowerlines', label: 'Near Power Lines', icon: Zap },
              { key: 'nearBuilding', label: 'Near Building', icon: Building2 },
              { key: 'noParking', label: 'No Parking', icon: ParkingCircle },
            ].map(({ key, label, icon: Icon }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer select-none py-1">
                <div
                  onClick={() => toggle(key)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                    form[key] ? 'bg-green-600 border-green-600' : 'border-gray-300'
                  }`}
                >
                  {form[key] && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Treatments ── */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Treatments</h2>
          {selectedTreatments.length > 0 && (
            <span className="text-sm font-medium text-green-600">${total.toLocaleString()}</span>
          )}
        </div>

        {selectedTreatments.length > 0 && (
          <div className="space-y-2 mb-3">
            {selectedTreatments.map(t => (
              <div key={t.id} className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
                <span className="text-sm flex-1 font-medium text-green-800">{t.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">$</span>
                  <input
                    type="number"
                    className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm text-right"
                    value={t.price}
                    onChange={e => updatePrice(t.id, e.target.value)}
                    min="0"
                  />
                </div>
                <button onClick={() => toggleTreatment(t)} className="text-gray-400 hover:text-red-500 ml-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowTreatments(v => !v)}
          className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-green-300 hover:text-green-600 transition-colors"
        >
          + Add Treatment
        </button>

        {showTreatments && (
          <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
            {treatments.map(t => {
              const selected = selectedTreatments.some(st => st.id === t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTreatment(t)}
                  className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors text-left ${selected ? 'bg-green-50' : ''}`}
                >
                  <span className="text-sm font-medium text-gray-800">{t.name}</span>
                  <div className="flex items-center gap-2">
                    {t.defaultPrice > 0 && (
                      <span className="text-xs text-gray-400">${t.defaultPrice}</span>
                    )}
                    {selected && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Photos ── */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Camera className="w-4 h-4 text-blue-500" /> Photos
        </h2>

        {form.photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {form.photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black bg-opacity-60 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={handlePhotoCapture}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4" /> Take / Upload Photo
        </button>
      </div>

      {/* ── Notes ── */}
      <div className="card mb-6">
        <label className="label">Tree Notes</label>
        <textarea
          className="input"
          rows={3}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Any notes about this tree..."
        />
      </div>

      {/* Save */}
      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handleSave} className="btn-primary flex-1">Save Tree</button>
      </div>
    </div>
  );
}
