# Adding Dashboard Routes to Your App

## Quick Integration Guide

Since this project doesn't have a router set up yet, here's how to integrate the admin dashboard pages when you're ready:

### Option 1: Using React Router (Recommended)

1. **Install React Router:**
```bash
npm install react-router-dom
```

2. **Update `src/main.tsx`:**
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Import pages
import { HomePage } from './pages/HomePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminAthletesPage } from './pages/AdminAthletesPage';
import { AdminParentIntakePage } from './pages/AdminParentIntakePage';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/athletes" element={<AdminAthletesPage />} />
        <Route path="/admin/parents" element={<AdminParentIntakePage />} />
        {/* Add more admin routes as needed */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
```

3. **Update navigation links in `DashboardLayout.tsx`:**
```tsx
import { Link } from 'react-router-dom';

// Replace <a> tags with <Link> components:
<Link
  to={item.href}
  className={/* ... */}
>
  <Icon className="w-5 h-5" />
  <span>{item.name}</span>
</Link>
```

### Option 2: Simple Demo (No Router)

To quickly view the dashboard without setting up routing:

1. **Update `src/App.tsx`:**
```tsx
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function App() {
  return <AdminDashboardPage />;
}

export default App;
```

2. **To switch between pages, manually change the import:**
```tsx
// For Athletes page:
import { AdminAthletesPage } from './pages/AdminAthletesPage';
function App() {
  return <AdminAthletesPage />;
}

// For Parent Intake page:
import { AdminParentIntakePage } from './pages/AdminParentIntakePage';
function App() {
  return <AdminParentIntakePage />;
}
```

### Adding Protected Routes (Optional)

When you add authentication, protect admin routes:

```tsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = false; // Replace with actual auth check

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

// In your Routes:
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute>
      <AdminDashboardPage />
    </ProtectedRoute>
  }
/>
```

## Available Admin Routes

- `/admin/dashboard` - Main overview with all sections
- `/admin/athletes` - Athlete signups management
- `/admin/parents` - Parent intake forms management
- `/admin/creators` - Creator applications (create similar to athletes page)
- `/admin/teams` - Team inquiries (create similar to athletes page)
- `/admin/media-passes` - Media pass requests (create similar to athletes page)
- `/admin/supporters` - Supporter signups (create similar to athletes page)
- `/admin/settings` - Settings page (to be created)

## Creating Additional Admin Pages

Use the existing pages as templates. All admin pages should:

1. Wrap content in `<DashboardLayout currentPage="Page Name">`
2. Use `StatCard` components for metrics
3. Use `DataTable` for data lists
4. Use `DashboardCard` for grouped content
5. Match the navy/gold color scheme
6. Be mobile responsive

Example structure:
```tsx
import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { DataTable, TableColumn } from '../components/DataTable';

export function AdminNewPage() {
  return (
    <DashboardLayout currentPage="New Page">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Stat 1" value="100" icon={Icon} color="blue" />
      </div>

      {/* Data Table */}
      <DataTable
        title="Data"
        columns={columns}
        data={data}
      />
    </DashboardLayout>
  );
}
```
