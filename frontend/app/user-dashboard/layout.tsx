import AuthGuard from '@/components/AuthGuard';

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['user', 'admin']}>
      {children}
    </AuthGuard>
  );
}
