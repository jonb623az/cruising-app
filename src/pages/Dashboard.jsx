import { useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import {
  CheckCircle, Clock, Send, Map, TreePine, User, Plus, TrendingUp, AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';

function StatCard({ label, value, sub, icon: Icon, accent }) {
  const accents = {
    green:  'border-l-green-500',
    yellow: 'border-l-yellow-400',
    blue:   'border-l-blue-500',
    purple: 'border-l-purple-500',
  };
  const iconBg = {
    green:  'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue:   'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  return (
    <div className={`bg-white rounded-xl border-l-4 shadow-sm p-5 flex items-center gap-4 ${accents[accent]}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg[accent]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function dateLabel(dateStr) {
  if (!dateStr) return '—';
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d, yyyy');
}

export default function Dashboard() {
  const { state, selectors } = useApp();
  const navigate = useNavigate();

  const approved  = state.jobs.filter(j => ['approved', 'completed', 'scheduled'].includes(j.status));
  const sent      = state.jobs.filter(j => j.status === 'estimate_sent');
  const completed = state.jobs.filter(j => j.status === 'completed');
  const leads     = state.jobs.filter(j => j.status === 'lead');

  const approvedTotal = approved.reduce((s, j) => s + (j.estimateTotal || 0), 0);
  const sentTotal     = sent.reduce((s, j) => s + (j.estimateTotal || 0), 0);

  const activeJobs = state.jobs
    .filter(j => !['completed', 'invoiced'].includes(j.status))
    .sort((a, b) => {
      if (!a.scheduledDate && !b.scheduledDate) return 0;
      if (!a.scheduledDate) return 1;
      if (!b.scheduledDate) return -1;
      return a.scheduledDate.localeCompare(b.scheduledDate);
    });

  const recentAlerts = selectors.getUnreadAlerts().slice(0, 6);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <button
          onClick={() => navigate('/clients/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Client
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Approved"       value={approved.length}  sub={`$${approvedTotal.toLocaleString()} total`}   icon={CheckCircle}  accent="green"  />
        <StatCard label="Estimates Sent" value={sent.length}      sub={`$${sentTotal.toLocaleString()} pending`}     icon={Send}         accent="yellow" />
        <StatCard label="Completed"      value={completed.length} sub="all time"                                     icon={TrendingUp}   accent="blue"   />
        <StatCard label="Open Leads"     value={leads.length}     sub="in pipeline"                                  icon={AlertCircle}  accent="purple" />
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Active jobs table — takes 2/3 width on xl */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Active Jobs</h2>
            <button
              onClick={() => navigate('/calendar')}
              className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" /> View calendar
            </button>
          </div>

          {activeJobs.length === 0 ? (
            <div className="text-center py-16">
              <TreePine className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No active jobs yet</p>
              <button onClick={() => navigate('/clients/new')} className="mt-3 text-green-600 text-sm font-medium hover:underline">
                Add your first client →
              </button>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div className="grid grid-cols-12 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <div className="col-span-4">Client / Property</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Assigned To</div>
                <div className="col-span-2 text-right">Value</div>
              </div>
              <div className="divide-y divide-gray-50">
                {activeJobs.map(job => {
                  const client   = selectors.getClientById(job.clientId);
                  const property = selectors.getPropertyById(job.propertyId);
                  const assignee = selectors.getUserById(job.assignedTo);
                  return (
                    <div
                      key={job.id}
                      onClick={() => navigate(`/properties/${job.propertyId}`)}
                      className="grid grid-cols-12 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors items-center group"
                    >
                      <div className="col-span-4 min-w-0 pr-3">
                        <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-green-700 transition-colors">
                          {client ? `${client.firstName} ${client.lastName}` : 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {property?.propertyName || property?.address}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <StatusBadge status={job.status} />
                      </div>
                      <div className="col-span-2 text-sm text-gray-600">
                        {dateLabel(job.scheduledDate)}
                      </div>
                      <div className="col-span-2 text-sm text-gray-500 truncate">
                        {assignee ? assignee.name : <span className="text-gray-300 italic text-xs">Unassigned</span>}
                      </div>
                      <div className="col-span-2 text-right font-semibold text-sm">
                        {job.estimateTotal > 0
                          ? <span className="text-green-600">${job.estimateTotal.toLocaleString()}</span>
                          : <span className="text-gray-300">—</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Quick actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Add New Client',  icon: User,  to: '/clients/new',    color: 'text-green-700  bg-green-50  hover:bg-green-100'  },
                { label: 'Add Property',    icon: Map,   to: '/properties/new', color: 'text-blue-700   bg-blue-50   hover:bg-blue-100'   },
                { label: 'View Calendar',   icon: Clock, to: '/calendar',       color: 'text-purple-700 bg-purple-50 hover:bg-purple-100' },
                { label: 'View Proposals',  icon: Send,  to: '/proposals',      color: 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100' },
              ].map(({ label, icon: Icon, to, color }) => (
                <button
                  key={label}
                  onClick={() => navigate(to)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${color}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Recent Alerts</h2>
              {recentAlerts.length > 0 && (
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                  {recentAlerts.length} new
                </span>
              )}
            </div>
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {recentAlerts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No new alerts</p>
              ) : (
                recentAlerts.map(alert => (
                  <div key={alert.id} className="px-5 py-3 bg-green-50 border-l-4 border-l-green-500">
                    <p className="text-sm text-gray-800">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
