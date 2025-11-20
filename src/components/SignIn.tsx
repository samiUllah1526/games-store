import { useState } from 'react';
import { Button, Input, Card, CardBody, CardHeader } from '@heroui/react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <Card>
        <CardBody>
          <p>You are already signed in as {user.email}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <h2 className="m-0">Sign In</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            {error && (
              <div className="text-red-600 p-2 bg-red-50 rounded">
                {error}
              </div>
            )}
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              isDisabled={loading}
            />
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              isDisabled={loading}
            />
            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              isDisabled={loading}
            >
              Sign In
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

