import { useState } from 'react';
import { Button } from '@heroui/react';
import HeroUIProvider from './HeroUIProvider';
import AuthProvider from './AuthProvider';
import Sidebar from './Sidebar';
import HeroUIExample from './HeroUIExample';
import AuthStatus from './AuthStatus';
import { useAuth } from './AuthProvider';

function DashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <AuthStatus />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 lg:ml-64">
        {/* Mobile Menu Button */}
        <div className="lg:hidden p-4 border-b bg-white">
          <Button
            variant="light"
            onPress={() => setSidebarOpen(true)}
            className="min-w-0"
          >
            ☰ Menu
          </Button>
        </div>
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            <HeroUIExample />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <HeroUIProvider>
      <AuthProvider>
        <DashboardContent />
      </AuthProvider>
    </HeroUIProvider>
  );
}

