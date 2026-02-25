import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Clients, { NewClientForm } from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Properties, { NewPropertyForm } from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import TreeForm from './pages/TreeForm';
import Proposals, { NewProposalForm, ProposalDetail } from './pages/Proposals';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        {/* Clients */}
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/new" element={<div className="max-w-lg mx-auto"><h1 className="text-xl font-bold mb-5">New Client</h1><NewClientForm /></div>} />
        <Route path="/clients/:id" element={<ClientDetail />} />

        {/* Properties */}
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/new" element={<NewPropertyForm />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />

        {/* Trees */}
        <Route path="/trees/new" element={<TreeForm />} />
        <Route path="/trees/:treeId" element={<TreeForm />} />

        {/* Proposals */}
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/proposals/new" element={<NewProposalForm />} />
        <Route path="/proposals/:id" element={<ProposalDetail />} />

        {/* Calendar */}
        <Route path="/calendar" element={<Calendar />} />

        {/* Settings (admin only) */}
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
