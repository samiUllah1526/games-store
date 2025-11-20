import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Switch,
  Select,
  SelectItem
} from '@heroui/react';
import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  const [language, setLanguage] = useState('en');

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    if (typeof window !== 'undefined') {
      if (enabled) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', {
      notifications,
      emailNotifications,
      darkMode,
      language,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>Settings</ModalHeader>
        <ModalBody>
          <div className="space-y-6 py-4">
            {/* Notifications Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-500">Receive push notifications</p>
                  </div>
                  <Switch
                    isSelected={notifications}
                    onValueChange={setNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive email updates</p>
                  </div>
                  <Switch
                    isSelected={emailNotifications}
                    onValueChange={setEmailNotifications}
                  />
                </div>
              </div>
            </div>

            {/* Appearance Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Appearance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-500">Toggle dark theme</p>
                </div>
                <Switch
                  isSelected={darkMode}
                  onValueChange={toggleDarkMode}
                />
              </div>
            </div>

            {/* Language Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Language</h3>
              <Select
                label="Select Language"
                selectedKeys={[language]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setLanguage(selected);
                }}
              >
                <SelectItem key="en" value="en">English</SelectItem>
                <SelectItem key="es" value="es">Spanish</SelectItem>
                <SelectItem key="fr" value="fr">French</SelectItem>
                <SelectItem key="de" value="de">German</SelectItem>
              </Select>
            </div>

            {/* Privacy Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Privacy</h3>
              <div className="space-y-2">
                <Button variant="light" className="w-full justify-start">
                  Privacy Policy
                </Button>
                <Button variant="light" className="w-full justify-start">
                  Terms of Service
                </Button>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSave}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

