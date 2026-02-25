// Default tree species list
export const TREE_SPECIES = [
  'Apple', 'Ash', 'Birch', 'Cedar', 'Cherry', 'Cottonwood', 'Dogwood',
  'Douglas Fir', 'Elm', 'Eucalyptus', 'Fir', 'Hemlock', 'Hickory',
  'Larch', 'Locust', 'Magnolia', 'Maple', 'Mulberry', 'Oak', 'Palm',
  'Pine', 'Poplar', 'Redwood', 'Sequoia', 'Spruce', 'Sycamore',
  'Walnut', 'Willow', 'Other',
];

// DBH ranges (Diameter at Breast Height)
export const DBH_RANGES = [
  '0–6"', '7–12"', '13–18"', '19–24"', '25–30"', '31–36"', '37–48"', '49"+',
];

// Tree condition ratings
export const TREE_RATINGS = [
  { value: 'excellent', label: 'Excellent', color: 'green' },
  { value: 'good', label: 'Good', color: 'lime' },
  { value: 'fair', label: 'Fair', color: 'yellow' },
  { value: 'poor', label: 'Poor', color: 'orange' },
  { value: 'critical', label: 'Critical', color: 'red' },
  { value: 'dead', label: 'Dead', color: 'gray' },
];

// Default treatments with base pricing
export const DEFAULT_TREATMENTS = [
  { id: 't1', name: 'Maintenance Trimming', defaultPrice: 150, unit: 'per tree' },
  { id: 't2', name: 'Crown Clean', defaultPrice: 200, unit: 'per tree' },
  { id: 't3', name: 'Crown Reduction', defaultPrice: 350, unit: 'per tree' },
  { id: 't4', name: 'Crown Raise / Canopy Lift', defaultPrice: 175, unit: 'per tree' },
  { id: 't5', name: 'Crown Thin', defaultPrice: 250, unit: 'per tree' },
  { id: 't6', name: 'Dead Wooding', defaultPrice: 125, unit: 'per tree' },
  { id: 't7', name: 'Removal', defaultPrice: 800, unit: 'per tree' },
  { id: 't8', name: 'Stump Grinding', defaultPrice: 150, unit: 'per stump' },
  { id: 't9', name: 'Cable & Bracing', defaultPrice: 400, unit: 'per tree' },
  { id: 't10', name: 'Deep Root Fertilization', defaultPrice: 120, unit: 'per tree' },
  { id: 't11', name: 'Pest / Disease Treatment', defaultPrice: 175, unit: 'per tree' },
  { id: 't12', name: 'Emergency Storm Work', defaultPrice: 0, unit: 'per job' },
  { id: 't13', name: 'Lot Clearing', defaultPrice: 0, unit: 'per job' },
  { id: 't14', name: 'Chipping / Haul Away', defaultPrice: 200, unit: 'per load' },
];

// US States
export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV',
  'NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN',
  'TX','UT','VT','VA','WA','WV','WI','WY',
];

// Job statuses
export const JOB_STATUSES = {
  LEAD: 'lead',
  ESTIMATE_SCHEDULED: 'estimate_scheduled',
  ESTIMATE_SENT: 'estimate_sent',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  INVOICED: 'invoiced',
};

export const STATUS_LABELS = {
  lead: 'Lead',
  estimate_scheduled: 'Est. Scheduled',
  estimate_sent: 'Estimate Sent',
  approved: 'Approved',
  rejected: 'Rejected',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  invoiced: 'Invoiced',
};

export const STATUS_COLORS = {
  lead: 'bg-gray-100 text-gray-700',
  estimate_scheduled: 'bg-blue-100 text-blue-700',
  estimate_sent: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  scheduled: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-200 text-green-800',
  invoiced: 'bg-purple-100 text-purple-700',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  OFFICE: 'office',
  ESTIMATOR: 'estimator',
  CREW_LEADER: 'crew_leader',
  CREW: 'crew',
};
