import { HeroUIProvider } from '@heroui/react';
import type { ReactNode } from 'react';

interface ProviderProps {
  children: ReactNode;
}

export default function HeroUIProviderWrapper({ children }: ProviderProps) {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}

