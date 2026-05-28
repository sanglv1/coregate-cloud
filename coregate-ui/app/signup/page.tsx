'use client';

import { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: 'Account created',
      description: 'Demo mode: your account is ready.',
    });
    router.push('/browse');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border/40 bg-card/50 p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-sm text-muted-foreground">Start selling digital products in minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm">Full name</label>
            <Input id="name" type="text" placeholder="CoreGate Seller" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm">Email</label>
            <Input id="email" type="email" placeholder="seller@coregate.local" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm">Password</label>
            <Input id="password" type="password" placeholder="********" required />
          </div>
          <Button type="submit" className="w-full">Create Account</Button>
        </form>

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
