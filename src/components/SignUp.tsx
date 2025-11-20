import { useState } from 'react';
import { Button, Input, Card, CardBody, CardHeader } from '@heroui/react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up');
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

  if (success) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <Card>
          <CardBody>
            <p className="text-green-600">
              Sign up successful! Please check your email to verify your account.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <h2 className="m-0">Sign Up</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
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
              placeholder="Enter your password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              isDisabled={loading}
            />
            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              isDisabled={loading}
            />
            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              isDisabled={loading}
            >
              Sign Up
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

