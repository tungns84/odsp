import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import { RouteErrorBoundary } from './components/common/RouteErrorBoundary';

// Lazy load all page components for code splitting
const ConnectorManagement = lazy(() => import('./features/connectors/ConnectorManagement').then(m => ({ default: m.ConnectorManagement })));
const CreateDataEndpointWizard = lazy(() => import('./features/dataEndpoints/CreateDataEndpointWizard').then(m => ({ default: m.CreateDataEndpointWizard })));
const DataEndpointManagement = lazy(() => import('./features/dataEndpoints/DataEndpointManagement').then(m => ({ default: m.DataEndpointManagement })));
const DataEndpointDetails = lazy(() => import('./features/dataEndpoints/DataEndpointDetails').then(m => ({ default: m.DataEndpointDetails })));
const DataExplorer = lazy(() => import('./features/explorer/DataExplorer').then(m => ({ default: m.DataExplorer })));
const TenantManagement = lazy(() => import('./features/tenants/TenantManagement').then(m => ({ default: m.TenantManagement })));
const TenantDetails = lazy(() => import('./features/tenants/TenantDetails').then(m => ({ default: m.TenantDetails })));

// Workflow components
const EndpointTaskInbox = lazy(() => import('./features/workflow/EndpointTaskInbox').then(m => ({ default: m.EndpointTaskInbox })));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden="true"></div>
        <p className="text-sm text-text-tertiary">Loading…</p>
        <span className="sr-only">Page content is loading</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <RouteErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<MainLayout><ConnectorManagement /></MainLayout>} />
              <Route path="/tenants" element={<MainLayout><TenantManagement /></MainLayout>} />
              <Route path="/tenants/:id" element={<MainLayout><TenantDetails /></MainLayout>} />
              <Route path="/endpoints" element={<MainLayout><DataEndpointManagement /></MainLayout>} />
              <Route path="/data-endpoints/create" element={<CreateDataEndpointWizard />} />
              <Route path="/data-endpoints/:id" element={<MainLayout><DataEndpointDetails /></MainLayout>} />
              <Route path="/explorer" element={<MainLayout><DataExplorer /></MainLayout>} />

              {/* Workflow Routes */}
              <Route path="/workflow/tasks" element={<MainLayout><EndpointTaskInbox /></MainLayout>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </RouteErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
