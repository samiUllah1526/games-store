import HeroUIProvider from './HeroUIProvider';
import AuthProvider from './AuthProvider';
import SignUp from './SignUp';

export default function SignUpPage() {
  return (
    <HeroUIProvider>
      <AuthProvider>
        <SignUp />
      </AuthProvider>
    </HeroUIProvider>
  );
}

