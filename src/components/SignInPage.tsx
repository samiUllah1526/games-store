import HeroUIProvider from './HeroUIProvider';
import AuthProvider from './AuthProvider';
import SignIn from './SignIn';

export default function SignInPage() {
  return (
    <HeroUIProvider>
      <AuthProvider>
        <SignIn />
      </AuthProvider>
    </HeroUIProvider>
  );
}

