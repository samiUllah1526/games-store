import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar, Input } from '@heroui/react';
import { useAuth } from './AuthProvider';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>Profile</ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar
              src={user?.user_metadata?.avatar_url}
              name={user?.email?.charAt(0).toUpperCase() || 'U'}
              size="lg"
              className="w-24 h-24 text-large"
            />
            <div className="text-center">
              <h3 className="text-lg font-semibold">{user?.email}</h3>
              <p className="text-sm text-gray-500">User ID: {user?.id}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Email"
              value={user?.email || ''}
              isReadOnly
              variant="bordered"
            />
            <Input
              label="User ID"
              value={user?.id || ''}
              isReadOnly
              variant="bordered"
            />
            <div>
              <p className="text-sm text-gray-600 mb-2">Account Created</p>
              <p className="text-sm">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Last Sign In</p>
              <p className="text-sm">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

