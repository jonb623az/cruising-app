import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, FileText, Send, CheckCircle, XCircle, ChevronRight,
  TreePine, DollarSign, Plus, Edit2, Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import { format, parseISO } from 'date-fns';

// ─── New Proposal Form ────────────────────────────────────────────────────
export function NewProposalForm() {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const navigate = useNavigate();
  const { selectors, actions, state } = useApp();

  const property = selectors.getPropertyById(propertyId);
  const client = property ? selectors.getClientById(property.clientId) : null;

  const [name, setName] = useState('');
  const [selectedTrees, setSelectedTrees] = useState(
    (property?.trees || []).map(t => ({ ...t, included: true }))
  );
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const toggleTree = (treeId) => {
    setSelectedTrees(prev => prev.map(t => t.id === treeId ? { ...t, included: !t.included } : t));
  };

  const includedTrees = selectedTrees.filter(t => t.included);
  const total = includedTrees.reduce((s, t) =>
    s + (t.treatments?.reduce((ts, tr) => ts + (tr.price || 0), 0) || 0), 0
  );

  const handleSave = () => {
    const e = {};
    if (!name.trim()) e.name = 'Please enter a proposal name';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const proposal = actions.addProposal({
      propertyId,
      clientId: property?.clientId,
      name: name.trim(),
      trees: includedTrees,
      total,
      notes,
      status: 'estimate_sent',
      sentAt: null,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: '',
    });

    // Update active job estimate total
    const jobs = selectors.getJobsForProperty(propertyId);
    const activeJob = jobs.find(j => !['completed', 'invoiced'].includes(j.status));
    if (activeJob) {
      actions.updateJob({ ...activeJob, estimateTotal: total, status: 'estimate_sent' });
    }

    navigate(`/proposals/${proposal.id}`);
  };

  if (!property) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Property not found.</p>
      <button onClick={() => navigate('/properties')} className="mt-4 btn-secondary">← Back</button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> {property.propertyName}
      </button>

      <h1 className="text-xl font-bold mb-5">Create Proposal</h1>

      {/* Proposal name */}
      <div className="card mb-4">
        <label className="label">Proposal Name / Title *</label>
        <input
          className={`input ${errors.name ? 'border-red-400' : ''}`}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Spring Tree Care 2025"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* Client & Property summary */}
      <div className="card mb-4 bg-gray-50">
        <div className="flex justify-between text-sm">
          <div>
            <p className="font-medium text-gray-700">{client?.firstName} {client?.lastName}</p>
            <p className="text-gray-500 text-xs mt-0.5">{property.address}, {property.city}, {property.state}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-700 text-lg">${total.toLocaleString()}</p>
            <p className="text-xs text-gray-400">{includedTrees.length} trees</p>
          </div>
        </div>
      </div>

      {/* Trees selection */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-800 mb-3">Trees Included</h2>
        {selectedTrees.length === 0 ? (
          <div className="text-center py-4">
            <TreePine className="w-6 h-6 text-gray-300 mx-auto mb-1" />
            <p className="text-sm text-gray-400">No trees added to property yet</p>
            <button
              onClick={() => navigate(`/trees/new?propertyId=${propertyId}`)}
              className="mt-2 text-sm text-green-600 hover:underline"
            >
              Add trees first →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedTrees.map(tree => {
              const treeCost = tree.treatments?.reduce((s, t) => s + (t.price || 0), 0) || 0;
              return (
                <label key={tree.id} className="flex items-center gap-3 cursor-pointer py-2 border-b border-gray-50 last:border-0">
                  <div
                    onClick={() => toggleTree(tree.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      tree.included ? 'bg-green-600 border-green-600' : 'border-gray-300'
                    }`}
                  >
                    {tree.included && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {tree.treeNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{tree.species || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">
                      {tree.treatments?.map(t => t.name).join(', ') || 'No treatments'}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${tree.included ? 'text-green-600' : 'text-gray-300'}`}>
                    ${treeCost.toLocaleString()}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="card mb-6">
        <label className="label">Proposal Notes</label>
        <textarea
          className="input"
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Additional notes, terms, or conditions..."
        />
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handleSave} className="btn-primary flex-1">Save Proposal</button>
      </div>
    </div>
  );
}

// ─── Proposal Detail ──────────────────────────────────────────────────────
export function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, actions, selectors } = useApp();

  const proposal = state.proposals.find(p => p.id === id);
  const property = proposal ? selectors.getPropertyById(proposal.propertyId) : null;
  const client = proposal ? selectors.getClientById(proposal.clientId) : null;

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!proposal) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Proposal not found.</p>
      <button onClick={() => navigate('/proposals')} className="mt-4 btn-secondary">← Back</button>
    </div>
  );

  const handleApprove = () => {
    actions.updateProposal({ ...proposal, status: 'approved', approvedAt: new Date().toISOString() });
    // Update job
    const jobs = selectors.getJobsForProperty(proposal.propertyId);
    const activeJob = jobs.find(j => !['completed', 'invoiced'].includes(j.status));
    if (activeJob) actions.updateJob({ ...activeJob, status: 'approved' });
    actions.addAlert(
      `${client?.firstName} ${client?.lastName} approved "${proposal.name}" — $${proposal.total?.toLocaleString()}`,
      'approval'
    );
  };

  const handleReject = () => {
    actions.updateProposal({
      ...proposal, status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectionReason: rejectReason,
    });
    const jobs = selectors.getJobsForProperty(proposal.propertyId);
    const activeJob = jobs.find(j => !['completed', 'invoiced'].includes(j.status));
    if (activeJob) actions.updateJob({ ...activeJob, status: 'rejected' });
    setShowRejectModal(false);
  };

  return (
    <div className="max-w-lg mx-auto pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Proposal header */}
      <div className="card mb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1 mr-3">
            <h1 className="text-xl font-bold">{proposal.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {property?.address}, {property?.city}, {property?.state}
            </p>
          </div>
          <StatusBadge status={proposal.status} />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
          <div>
            <p className="text-xs text-gray-400">Client</p>
            <p className="font-medium text-sm">{client?.firstName} {client?.lastName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-2xl font-bold text-green-700">${proposal.total?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Approval actions */}
      {proposal.status === 'estimate_sent' && (
        <div className="card mb-4 border-yellow-100 bg-yellow-50">
          <p className="text-sm font-medium text-yellow-800 mb-3">Awaiting client approval</p>
          <div className="flex gap-2">
            <button onClick={handleApprove} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button onClick={() => setShowRejectModal(true)} className="btn-danger flex-1 flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Use these to manually approve/reject on behalf of client
          </p>
        </div>
      )}

      {proposal.status === 'approved' && (
        <div className="card mb-4 border-green-200 bg-green-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Approved</p>
              {proposal.approvedAt && (
                <p className="text-xs text-green-600">{format(parseISO(proposal.approvedAt), 'MMM d, yyyy h:mm a')}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {proposal.status === 'rejected' && (
        <div className="card mb-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-medium text-red-800">Rejected</p>
              {proposal.rejectionReason && (
                <p className="text-xs text-red-600 mt-0.5">Reason: {proposal.rejectionReason}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trees */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-800 mb-3">
          Trees ({proposal.trees?.length || 0})
        </h2>
        <div className="space-y-3">
          {proposal.trees?.map(tree => {
            const treeCost = tree.treatments?.reduce((s, t) => s + (t.price || 0), 0) || 0;
            return (
              <div key={tree.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center">
                    {tree.treeNumber}
                  </div>
                  <span className="font-medium text-sm">{tree.species || 'Unknown'}</span>
                  <span className="text-xs text-gray-400">DBH: {tree.dbh}</span>
                  <span className="ml-auto font-medium text-green-600">${treeCost.toLocaleString()}</span>
                </div>
                {tree.treatments?.map(t => (
                  <div key={t.id} className="flex justify-between text-xs text-gray-500 pl-8 py-0.5">
                    <span>{t.name}</span>
                    <span>${t.price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between pt-3 border-t border-gray-200 mt-3">
          <span className="font-bold">Total</span>
          <span className="font-bold text-green-700">${proposal.total?.toLocaleString()}</span>
        </div>
      </div>

      {/* Notes */}
      {proposal.notes && (
        <div className="card mb-4">
          <p className="text-xs font-medium text-gray-400 mb-1">Notes</p>
          <p className="text-sm text-gray-700">{proposal.notes}</p>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Reject Proposal</h3>
            </div>
            <div className="p-4">
              <label className="label">Reason for rejection</label>
              <textarea
                className="input"
                rows={4}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Price too high, decided not to proceed, going with another company..."
              />
            </div>
            <div className="p-4 flex gap-3 border-t border-gray-100">
              <button onClick={() => setShowRejectModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleReject} className="btn-danger flex-1">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Proposals List ───────────────────────────────────────────────────────
export default function Proposals() {
  const { state, selectors } = useApp();
  const navigate = useNavigate();

  const proposals = [...state.proposals].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const totalApproved = proposals
    .filter(p => p.status === 'approved')
    .reduce((s, p) => s + (p.total || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {proposals.length} total · ${totalApproved.toLocaleString()} approved
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {proposals.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-medium text-gray-400">No proposals yet</p>
            <p className="text-sm text-gray-400 mt-1">Create a proposal from any property page</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <div className="col-span-3">Proposal</div>
              <div className="col-span-3">Client</div>
              <div className="col-span-2">Property</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Trees</div>
              <div className="col-span-1 text-right">Total</div>
            </div>
            <div className="divide-y divide-gray-50">
              {proposals.map(prop => {
                const property = selectors.getPropertyById(prop.propertyId);
                const client   = selectors.getClientById(prop.clientId);
                return (
                  <div
                    key={prop.id}
                    onClick={() => navigate(`/proposals/${prop.id}`)}
                    className="grid grid-cols-12 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors items-center group"
                  >
                    <div className="col-span-3 flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="font-semibold text-sm text-gray-900 truncate group-hover:text-green-700 transition-colors">
                        {prop.name}
                      </span>
                    </div>
                    <div className="col-span-3 text-sm text-gray-500">
                      {client ? `${client.firstName} ${client.lastName}` : '—'}
                    </div>
                    <div className="col-span-2 text-sm text-gray-500 truncate pr-3">
                      {property?.address || '—'}
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={prop.status} />
                    </div>
                    <div className="col-span-1 text-sm text-gray-500">
                      {prop.trees?.length || 0}
                    </div>
                    <div className="col-span-1 text-right font-semibold text-sm text-green-600">
                      ${prop.total?.toLocaleString() || '0'}
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
