import { createContext, useContext, useReducer, useEffect } from 'react';
import { DEFAULT_TREATMENTS, USER_ROLES } from '../data/defaults';

const AppContext = createContext(null);

// ─── Seed data for demo ────────────────────────────────────────────────────
const SEED_DATA = {
  currentUser: {
    id: 'u1',
    name: 'Admin User',
    role: USER_ROLES.ADMIN,
    email: 'admin@cruisingapp.com',
  },
  users: [
    { id: 'u1', name: 'Admin User', role: USER_ROLES.ADMIN, email: 'admin@cruisingapp.com' },
    { id: 'u2', name: 'Sarah Office', role: USER_ROLES.OFFICE, email: 'sarah@cruisingapp.com' },
    { id: 'u3', name: 'Mike Estimator', role: USER_ROLES.ESTIMATOR, email: 'mike@cruisingapp.com' },
    { id: 'u4', name: 'Jake Crew', role: USER_ROLES.CREW, email: 'jake@cruisingapp.com' },
  ],
  clients: [
    {
      id: 'c1',
      firstName: 'James',
      lastName: 'Harrington',
      email: 'james.h@email.com',
      phone: '(555) 801-2233',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'c2',
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'msantos@email.com',
      phone: '(555) 774-9900',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ],
  properties: [
    {
      id: 'p1',
      clientId: 'c1',
      propertyName: 'Harrington Residence',
      address: '142 Oakwood Drive',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      notes: 'Large corner lot. Gate code: 4421.',
      trees: [],
    },
    {
      id: 'p2',
      clientId: 'c2',
      propertyName: 'Santos Home',
      address: '87 Maple Court',
      city: 'Portland',
      state: 'OR',
      zip: '97202',
      notes: 'Two large oaks in backyard near fence line.',
      trees: [],
    },
  ],
  jobs: [
    {
      id: 'j1',
      clientId: 'c1',
      propertyId: 'p1',
      status: 'approved',
      assignedTo: 'u3',
      scheduledDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
      estimateTotal: 1250,
      notes: 'Client approved via email.',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      completedAt: null,
    },
    {
      id: 'j2',
      clientId: 'c2',
      propertyId: 'p2',
      status: 'estimate_sent',
      assignedTo: 'u3',
      scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      estimateTotal: 875,
      notes: '',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      completedAt: null,
    },
  ],
  proposals: [],
  treatments: DEFAULT_TREATMENTS,
  alerts: [
    {
      id: 'a1',
      type: 'approval',
      message: 'James Harrington approved Estimate #1250',
      read: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
};

// ─── Reducer ───────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };

    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(c => c.id === action.payload.id ? action.payload : c),
      };

    case 'ADD_PROPERTY':
      return { ...state, properties: [...state.properties, action.payload] };

    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map(p => p.id === action.payload.id ? action.payload : p),
      };

    case 'ADD_JOB':
      return { ...state, jobs: [...state.jobs, action.payload] };

    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(j => j.id === action.payload.id ? action.payload : j),
      };

    case 'ADD_PROPOSAL':
      return { ...state, proposals: [...state.proposals, action.payload] };

    case 'UPDATE_PROPOSAL':
      return {
        ...state,
        proposals: state.proposals.map(p => p.id === action.payload.id ? action.payload : p),
      };

    case 'ADD_TREE_TO_PROPERTY': {
      const { propertyId, tree } = action.payload;
      return {
        ...state,
        properties: state.properties.map(p =>
          p.id === propertyId ? { ...p, trees: [...(p.trees || []), tree] } : p
        ),
      };
    }

    case 'UPDATE_TREE_ON_PROPERTY': {
      const { propertyId, tree } = action.payload;
      return {
        ...state,
        properties: state.properties.map(p =>
          p.id === propertyId
            ? { ...p, trees: p.trees.map(t => t.id === tree.id ? tree : t) }
            : p
        ),
      };
    }

    case 'ADD_TREATMENT':
      return { ...state, treatments: [...state.treatments, action.payload] };

    case 'UPDATE_TREATMENT':
      return {
        ...state,
        treatments: state.treatments.map(t => t.id === action.payload.id ? action.payload : t),
      };

    case 'DELETE_TREATMENT':
      return {
        ...state,
        treatments: state.treatments.filter(t => t.id !== action.payload),
      };

    case 'MARK_ALERT_READ':
      return {
        ...state,
        alerts: state.alerts.map(a => a.id === action.payload ? { ...a, read: true } : a),
      };

    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };

    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };

    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────
function loadState() {
  try {
    const saved = localStorage.getItem('cruising_state');
    return saved ? JSON.parse(saved) : SEED_DATA;
  } catch {
    return SEED_DATA;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    localStorage.setItem('cruising_state', JSON.stringify(state));
  }, [state]);

  // Helper: generate a short ID
  const genId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const actions = {
    addClient: (data) => {
      const client = { ...data, id: genId('c'), createdAt: new Date().toISOString() };
      dispatch({ type: 'ADD_CLIENT', payload: client });
      return client;
    },
    updateClient: (data) => dispatch({ type: 'UPDATE_CLIENT', payload: data }),

    addProperty: (data) => {
      const property = { ...data, id: genId('p'), trees: [] };
      dispatch({ type: 'ADD_PROPERTY', payload: property });
      return property;
    },
    updateProperty: (data) => dispatch({ type: 'UPDATE_PROPERTY', payload: data }),

    addJob: (data) => {
      const job = { ...data, id: genId('j'), createdAt: new Date().toISOString(), completedAt: null };
      dispatch({ type: 'ADD_JOB', payload: job });
      return job;
    },
    updateJob: (data) => dispatch({ type: 'UPDATE_JOB', payload: data }),

    addProposal: (data) => {
      const proposal = { ...data, id: genId('prop'), createdAt: new Date().toISOString() };
      dispatch({ type: 'ADD_PROPOSAL', payload: proposal });
      return proposal;
    },
    updateProposal: (data) => dispatch({ type: 'UPDATE_PROPOSAL', payload: data }),

    addTreeToProperty: (propertyId, treeData) => {
      const tree = { ...treeData, id: genId('tr'), addedAt: new Date().toISOString() };
      dispatch({ type: 'ADD_TREE_TO_PROPERTY', payload: { propertyId, tree } });
      return tree;
    },
    updateTree: (propertyId, tree) =>
      dispatch({ type: 'UPDATE_TREE_ON_PROPERTY', payload: { propertyId, tree } }),

    addTreatment: (data) => {
      const t = { ...data, id: genId('t') };
      dispatch({ type: 'ADD_TREATMENT', payload: t });
    },
    updateTreatment: (data) => dispatch({ type: 'UPDATE_TREATMENT', payload: data }),
    deleteTreatment: (id) => dispatch({ type: 'DELETE_TREATMENT', payload: id }),

    markAlertRead: (id) => dispatch({ type: 'MARK_ALERT_READ', payload: id }),
    addAlert: (msg, type = 'info') =>
      dispatch({
        type: 'ADD_ALERT',
        payload: { id: genId('al'), type, message: msg, read: false, createdAt: new Date().toISOString() },
      }),

    switchUser: (user) => dispatch({ type: 'SET_CURRENT_USER', payload: user }),
  };

  // Selectors
  const selectors = {
    getClientById: (id) => state.clients.find(c => c.id === id),
    getPropertyById: (id) => state.properties.find(p => p.id === id),
    getJobById: (id) => state.jobs.find(j => j.id === id),
    getPropertiesForClient: (clientId) => state.properties.filter(p => p.clientId === clientId),
    getJobsForProperty: (propertyId) => state.jobs.filter(j => j.propertyId === propertyId),
    getJobsForDate: (dateStr) => state.jobs.filter(j => j.scheduledDate === dateStr),
    getProposalsForProperty: (propertyId) => state.proposals.filter(p => p.propertyId === propertyId),
    getUnreadAlerts: () => state.alerts.filter(a => !a.read),
    getUserById: (id) => state.users.find(u => u.id === id),
    canViewJobCosting: () => [USER_ROLES.ADMIN, USER_ROLES.OFFICE, USER_ROLES.CREW_LEADER].includes(state.currentUser?.role),
    canManageSettings: () => state.currentUser?.role === USER_ROLES.ADMIN,
  };

  return (
    <AppContext.Provider value={{ state, actions, selectors }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
