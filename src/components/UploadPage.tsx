import { useState } from 'react';
import { Button } from '@heroui/react';
import HeroUIProvider from './HeroUIProvider';
import AuthProvider from './AuthProvider';
import Sidebar from './Sidebar';
import GameUpload from './GameUpload';
import { useAuth } from './AuthProvider';

function UploadPageContent() {
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
        <p>Please sign in to upload games.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 lg:ml-64">
        <div className="lg:hidden p-4 border-b bg-white dark:bg-gray-900">
          <Button
            variant="light"
            onPress={() => setSidebarOpen(true)}
            className="min-w-0"
          >
            ☰ Menu
          </Button>
        </div>
        <div className="p-8">
          <GameUpload />
        </div>
      </main>
    </div>
  );
}

export default function UploadPage() {
  return (
    <HeroUIProvider>
      <AuthProvider>
        <UploadPageContent />
      </AuthProvider>
    </HeroUIProvider>
  );
}

