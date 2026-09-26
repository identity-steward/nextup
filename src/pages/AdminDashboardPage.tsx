import { DashboardLayout } from '../components/DashboardLayout';

export function AdminDashboardPage() {
  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-4">
        <p className="text-gray-500 text-sm">NextUp admin dashboard. Use the sidebar to navigate to review workflows.</p>
      </div>
    </DashboardLayout>
  );
}
