import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Select,
  SelectItem,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
} from '@heroui/react';
import { supabase } from '../lib/supabase';
import { useRBAC } from '../hooks/useRBAC';

interface User {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
}

export default function UserRoleManagement() {
  const { isAdmin, loading: rbacLoading } = useRBAC();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!rbacLoading && isAdmin) {
      loadUsers();
      loadRoles();
    }
  }, [isAdmin, rbacLoading]);

  async function loadRoles() {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  }

  async function loadUsers() {
    try {
      // Get all users with their roles
      const { data: usersData, error: usersError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          roles!inner(id, name)
        `);

      // Get all auth users
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

      if (authError && authError.message !== 'Admin API is disabled') {
        // If admin API is disabled, we'll use a different approach
        console.warn('Admin API not available, using alternative method');
        return;
      }

      // Map users with their roles
      const usersMap = new Map<string, User>();
      
      if (authUsers) {
        authUsers.forEach((user) => {
          usersMap.set(user.id, {
            id: user.id,
            email: user.email || 'No email',
            created_at: user.created_at,
            roles: [],
          });
        });
      }

      // Add roles to users
      if (usersData) {
        usersData.forEach((ur: any) => {
          const user = usersMap.get(ur.user_id);
          if (user) {
            user.roles.push(ur.roles.name);
          }
        });
      }

      setUsers(Array.from(usersMap.values()));
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback: Show message that admin API is needed
    } finally {
      setLoading(false);
    }
  }

  const handleAssignRole = (user: User) => {
    setSelectedUser(user);
    setSelectedRole('');
    onOpen();
  };

  const submitRoleAssignment = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      const roleId = roles.find(r => r.name === selectedRole)?.id;
      if (!roleId) throw new Error('Role not found');

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedUser.id,
          role_id: roleId,
        });

      if (error) throw error;

      await loadUsers();
      onClose();
      setSelectedUser(null);
      setSelectedRole('');
    } catch (error: any) {
      console.error('Error assigning role:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleRemoveRole = async (userId: string, roleName: string) => {
    if (!confirm(`Remove ${roleName} role from this user?`)) return;

    try {
      const roleId = roles.find(r => r.name === roleName)?.id;
      if (!roleId) throw new Error('Role not found');

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId);

      if (error) throw error;

      await loadUsers();
    } catch (error: any) {
      console.error('Error removing role:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  if (rbacLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-500">Loading user management...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Card>
          <CardBody>
            <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
              Access Denied
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Admin access required to manage user roles.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          User Role Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Assign and manage roles for users
        </p>
      </div>

      <Card>
        <CardBody>
          <Input
            placeholder="Search by email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            startContent="🔍"
            className="mb-4"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Users</h2>
        </CardHeader>
        <CardBody className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {users.length === 0 
                  ? 'No users found. Note: Admin API must be enabled in Supabase to view users.'
                  : 'No users match your search'}
              </p>
            </div>
          ) : (
            <Table aria-label="Users table">
              <TableHeader>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLES</TableColumn>
                <TableColumn>CREATED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {user.roles.length === 0 ? (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            No roles
                          </span>
                        ) : (
                          user.roles.map((role) => (
                            <Chip
                              key={role}
                              size="sm"
                              variant="flat"
                              color={role === 'admin' ? 'danger' : role === 'moderator' ? 'warning' : 'default'}
                              onClose={() => handleRemoveRole(user.id, role)}
                            >
                              {role}
                            </Chip>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => handleAssignRole(user)}
                      >
                        Assign Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Assign Role Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Assign Role</ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">User</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Roles</p>
                  <div className="flex gap-2">
                    {selectedUser.roles.length === 0 ? (
                      <span className="text-sm text-gray-500">No roles</span>
                    ) : (
                      selectedUser.roles.map((role) => (
                        <Chip key={role} size="sm" variant="flat">
                          {role}
                        </Chip>
                      ))
                    )}
                  </div>
                </div>
                <Select
                  label="Select Role"
                  placeholder="Choose a role to assign"
                  selectedKeys={selectedRole ? [selectedRole] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setSelectedRole(selected);
                  }}
                >
                  {roles
                    .filter((role) => !selectedUser.roles.includes(role.name))
                    .map((role) => (
                      <SelectItem key={role.name} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                </Select>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={submitRoleAssignment}
              isDisabled={!selectedRole}
            >
              Assign Role
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

