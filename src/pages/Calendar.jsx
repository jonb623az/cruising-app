import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, User, TreePine, Plus } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday, parseISO,
} from 'date-fns';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';

export default function Calendar() {
  const { state, selectors } = useApp();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Build calendar grid
  const monthStart = startOfMonth(currentDate);
  const calStart   = startOfWeek(monthStart);
  const calEnd     = endOfWeek(endOfMonth(currentDate));

  const weeks = [];
  let day = calStart;
  while (day <= calEnd) {
    const week = [];
    for (let i = 0; i < 7; i++) { week.push(day); day = addDays(day, 1); }
    weeks.push(week);
  }

  const jobsForDay = (date) =>
    state.jobs.filter(j => j.scheduledDate === format(date, 'yyyy-MM-dd'));

  const selectedJobs = jobsForDay(selectedDate);

  const STATUS_DOT = {
    lead:               'bg-gray-400',
    estimate_scheduled: 'bg-blue-400',
    estimate_sent:      'bg-yellow-400',
    approved:           'bg-green-500',
    scheduled:          'bg-indigo-400',
    in_progress:        'bg-orange-400',
    completed:          'bg-green-700',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule and manage jobs</p>
        </div>
        <button onClick={() => navigate('/clients/new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Client
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Calendar panel */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button onClick={() => setCurrentDate(d => subMonths(d, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-gray-800 text-lg">{format(currentDate, 'MMMM yyyy')}</h2>
            <button onClick={() => setCurrentDate(d => addMonths(d, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
              ))}
            </div>

            {/* Grid */}
            <div className="space-y-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1">
                  {week.map((date, di) => {
                    const jobs     = jobsForDay(date);
                    const inMonth  = isSameMonth(date, currentDate);
                    const selected = isSameDay(date, selectedDate);
                    const today    = isToday(date);

                    return (
                      <button
                        key={di}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          relative rounded-xl p-2 min-h-[60px] flex flex-col items-start transition-colors text-left
                          ${!inMonth ? 'opacity-30' : ''}
                          ${selected ? 'bg-green-600 text-white shadow-sm' :
                            today    ? 'bg-green-50 ring-1 ring-green-300' :
                                       'hover:bg-gray-50'}
                        `}
                      >
                        <span className={`text-sm font-semibold mb-1 ${
                          selected ? 'text-white' : today ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {format(date, 'd')}
                        </span>
                        <div className="flex flex-wrap gap-0.5">
                          {jobs.slice(0, 4).map((job, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${selected ? 'bg-white opacity-80' : STATUS_DOT[job.status] || 'bg-gray-400'}`}
                            />
                          ))}
                          {jobs.length > 4 && (
                            <span className={`text-[9px] font-bold ${selected ? 'text-white' : 'text-gray-400'}`}>
                              +{jobs.length - 4}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="px-6 pb-4 flex flex-wrap gap-4">
            {[
              { label: 'Lead',      color: 'bg-gray-400' },
              { label: 'Est. Sent', color: 'bg-yellow-400' },
              { label: 'Approved',  color: 'bg-green-500' },
              { label: 'Scheduled', color: 'bg-indigo-400' },
              { label: 'Completed', color: 'bg-green-700' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Selected day jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">
              {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMMM d')}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} scheduled</p>
          </div>

          <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
            {selectedJobs.length === 0 ? (
              <div className="text-center py-16">
                <CalIcon className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium">No jobs this day</p>
              </div>
            ) : (
              selectedJobs.map(job => {
                const client   = selectors.getClientById(job.clientId);
                const property = selectors.getPropertyById(job.propertyId);
                const assignee = selectors.getUserById(job.assignedTo);
                return (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/properties/${job.propertyId}`)}
                    className="px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {client ? `${client.firstName} ${client.lastName}` : 'Unknown'}
                      </p>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {property?.propertyName || property?.address}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {assignee && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {assignee.name}
                        </span>
                      )}
                      {job.estimateTotal > 0 && (
                        <span className="text-green-600 font-semibold ml-auto">
                          ${job.estimateTotal.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
