import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ConnectorManagement } from './features/connectors/ConnectorManagement';
import { CreateDataEndpointWizard } from './features/dataEndpoints/CreateDataEndpointWizard';
import { DataEndpointManagement } from './features/dataEndpoints/DataEndpointManagement';
import { DataEndpointDetails } from './features/dataEndpoints/DataEndpointDetails';
import { DataExplorer } from './features/explorer/DataExplorer';
import { TenantManagement } from './features/tenants/TenantManagement';
import { TenantDetails } from './features/tenants/TenantDetails';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><ConnectorManagement /></MainLayout>} />
          <Route path="/tenants" element={<MainLayout><TenantManagement /></MainLayout>} />
          <Route path="/tenants/:id" element={<MainLayout><TenantDetails /></MainLayout>} />
          <Route path="/endpoints" element={<MainLayout><DataEndpointManagement /></MainLayout>} />
          <Route path="/data-endpoints/create" element={<CreateDataEndpointWizard />} />
          <Route path="/data-endpoints/:id" element={<MainLayout><DataEndpointDetails /></MainLayout>} />
          <Route path="/explorer" element={<MainLayout><DataExplorer /></MainLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
