import { Button, Card, CardBody } from '@heroui/react';
import { useAuth } from './AuthProvider';

export default function AuthStatus() {
  const { user, loading, signOut } = useAuth() 

  if (loading) {
    return (
      <Card>
        <CardBody>
          <p>Loading...</p>
        </CardBody>
      </Card>
    );
  }

  if (user) {
    return (
      <Card>
        <CardBody className="flex flex-col gap-4">
          <div>
            <p><strong>Signed in as:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
          <Button color="danger" onPress={signOut}>
            Sign Out
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <p>You are not signed in.</p>
        <div className="flex gap-4">
          <Button color="primary" as="a" href="/signin">
            Sign In
          </Button>
          <Button color="secondary" as="a" href="/signup">
            Sign Up
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

