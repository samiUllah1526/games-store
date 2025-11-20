import { 
  Button, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
  Avatar,
  Divider
} from '@heroui/react';
import { useAuth } from './AuthProvider';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal';

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ className = '', isOpen = true, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const { isOpen: isLogoutOpen, onOpen: onLogoutOpen, onClose: onLogoutClose } = useDisclosure();

  const handleLogout = async () => {
    await signOut();
    onLogoutClose();
  };

  if (!user) {
    return null;
  }

  const menuItems = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'My Games', href: '/games', icon: '🎮' },
    { label: 'Upload Game', href: '/upload', icon: '📤' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {onClose && (
        <div
          className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
        />
      )}
      
      <aside
        className={`bg-gray-900 text-white w-64 min-h-screen flex flex-col fixed z-50 transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${className}`}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Game Dashboard</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              src={user?.user_metadata?.avatar_url}
              name={user?.email?.charAt(0).toUpperCase() || 'U'}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-gray-400">User</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              fullWidth
              variant="flat"
              color="default"
              onPress={onProfileOpen}
              className="justify-start"
            >
              👤 Profile
            </Button>
            <Button
              fullWidth
              variant="flat"
              color="default"
              onPress={onSettingsOpen}
              className="justify-start"
            >
              ⚙️ Settings
            </Button>
            <Divider className="my-2" />
            <Button
              fullWidth
              variant="flat"
              color="danger"
              onPress={onLogoutOpen}
              className="justify-start"
            >
              🚪 Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={onProfileClose} />

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={onSettingsClose} />

      {/* Logout Confirmation Modal */}
      <Modal isOpen={isLogoutOpen} onClose={onLogoutClose}>
        <ModalContent>
          <ModalHeader>Confirm Logout</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to logout?</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onLogoutClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleLogout}>
              Logout
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

