# NextUp Admin Dashboard Layout

## Overview

A complete, production-ready admin dashboard layout system for NextUp with reusable components, consistent styling, and mobile responsiveness.

## Components Created

### 1. DashboardLayout
**File:** `src/components/DashboardLayout.tsx`

The main layout wrapper that provides the sidebar, topbar, and content area structure.

**Props:**
- `children: React.ReactNode` - The main content to display
- `currentPage?: string` - The current page name to highlight in navigation (default: "Dashboard")

**Features:**
- Responsive sidebar with mobile toggle
- Navigation menu with active state highlighting
- User profile section in topbar
- Notification bell icon
- Settings and logout options
- Consistent navy/gold color scheme matching NextUp brand

**Usage:**
```tsx
import { DashboardLayout } from '../components/DashboardLayout';

export function MyAdminPage() {
  return (
    <DashboardLayout currentPage="My Page">
      <div>Your content here</div>
    </DashboardLayout>
  );
}
```

### 2. StatCard
**File:** `src/components/StatCard.tsx`

Summary statistics card component for displaying key metrics.

**Props:**
- `title: string` - The stat title/label
- `value: string | number` - The stat value to display
- `icon: LucideIcon` - Icon component from lucide-react
- `change?: { value: string; positive: boolean }` - Optional change indicator
- `color?: 'blue' | 'green' | 'purple' | 'gold' | 'red' | 'orange'` - Color theme (default: 'blue')

**Usage:**
```tsx
import { StatCard } from '../components/StatCard';
import { Users } from 'lucide-react';

<StatCard
  title="Total Athletes"
  value="124"
  icon={Users}
  change={{ value: '12%', positive: true }}
  color="blue"
/>
```

### 3. DataTable
**File:** `src/components/DataTable.tsx`

Flexible table component for displaying tabular data with custom column rendering.

**Props:**
- `columns: TableColumn[]` - Array of column definitions
- `data: any[]` - Array of data objects
- `title?: string` - Optional table title
- `emptyMessage?: string` - Message to show when no data (default: "No data available")
- `onRowAction?: (row: any) => void` - Optional callback for row actions

**TableColumn Interface:**
```typescript
interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}
```

**Usage:**
```tsx
import { DataTable, TableColumn } from '../components/DataTable';

const columns: TableColumn[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => (
      <span className={value === 'Active' ? 'text-green-600' : 'text-gray-600'}>
        {value}
      </span>
    ),
  },
];

const data = [
  { name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
];

<DataTable
  title="Users"
  columns={columns}
  data={data}
  onRowAction={(row) => console.log('View user:', row)}
/>
```

### 4. DashboardCard
**File:** `src/components/DashboardCard.tsx`

Generic card component for grouping related content.

**Props:**
- `title: string` - Card title
- `subtitle?: string` - Optional subtitle
- `children: React.ReactNode` - Card content
- `action?: { label: string; onClick: () => void }` - Optional header action button
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { DashboardCard } from '../components/DashboardCard';

<DashboardCard
  title="Recent Activity"
  subtitle="Latest updates"
  action={{ label: 'View All', onClick: () => console.log('View all') }}
>
  <div>Your card content here</div>
</DashboardCard>
```

## Pages Created

### 1. AdminDashboardPage
**File:** `src/pages/AdminDashboardPage.tsx`

The main dashboard overview page with all sections.

**Features:**
- 6 summary stat cards (Athlete Signups, Parent Intakes, Creator Apps, Team Inquiries, Media Passes, Supporters)
- Recent submissions tables for each category
- Quick actions card
- Recent activity feed
- Fully populated with placeholder data

### 2. AdminAthletesPage
**File:** `src/pages/AdminAthletesPage.tsx`

Dedicated page for managing athlete signups.

**Features:**
- 4 summary stats (Total, Approved, Pending, Rejected)
- Advanced filters (search, sport, status, grade)
- Full athlete data table

### 3. AdminParentIntakePage
**File:** `src/pages/AdminParentIntakePage.tsx`

Dedicated page for managing parent intake forms.

**Features:**
- 3 summary stats (Total, Reviewed, Pending)
- Filters (search, review status, date range)
- Full parent intake data table

## Dashboard Sections

All sections are included in the main dashboard with placeholder tables:

1. **Athlete Signups** - Recent athlete profile submissions with approval status
2. **Parent Intake** - Parent/guardian intake forms with review status
3. **Creator Applications** - Content creator applications with platform info
4. **Team Inquiries** - School/team partnership inquiries with priority levels
5. **Media Pass Requests** - Media credential requests with approval workflow
6. **Supporter Signups** - Community supporter signups with tier information

## Navigation Structure

The sidebar includes links to:
- Dashboard (overview)
- Athlete Signups
- Parent Intake
- Creator Applications
- Team Inquiries
- Media Pass Requests
- Supporter Signups
- Settings
- Logout

## Styling & Design

**Color Scheme:**
- Primary: Navy (`#1a1f3a`)
- Accent: Gold (`#c5a572` to `#d4af37`)
- Background: Light gray (`#f9fafb`)
- Cards: White with subtle shadows

**Responsive Breakpoints:**
- Mobile: < 768px (stacked layout, hamburger menu)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: > 1024px (full layout with sidebar)

**Features:**
- Smooth transitions and hover effects
- Mobile-friendly navigation
- Accessible color contrasts
- Consistent spacing system
- Professional shadow and border styling

## Future Integration

To connect real data:

1. Replace placeholder data arrays with API/Supabase queries
2. Implement actual filter logic in filter components
3. Add row action handlers (view, edit, approve, reject)
4. Connect authentication to topbar user section
5. Implement notification system for bell icon
6. Add pagination for large datasets

## Example: Creating a New Admin Page

```tsx
import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { DataTable, TableColumn } from '../components/DataTable';
import { Mail } from 'lucide-react';

export function AdminMessagesPage() {
  const columns: TableColumn[] = [
    { key: 'from', label: 'From' },
    { key: 'subject', label: 'Subject' },
    { key: 'date', label: 'Date' },
  ];

  const messages = [
    { from: 'John Doe', subject: 'Question about signup', date: '2024-03-18' },
  ];

  return (
    <DashboardLayout currentPage="Messages">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Unread Messages"
          value="12"
          icon={Mail}
          color="blue"
        />
      </div>

      <DataTable
        title="Recent Messages"
        columns={columns}
        data={messages}
        onRowAction={(row) => console.log('View message:', row)}
      />
    </DashboardLayout>
  );
}
```

## Notes

- All components use TypeScript for type safety
- Components are fully reusable across different admin pages
- Styling is consistent with NextUp brand (navy/gold theme)
- Mobile responsive design included
- No backend/auth implementation - ready for integration
- Placeholder data can be easily replaced with real data sources
