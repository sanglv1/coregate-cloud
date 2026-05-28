'use client';

import { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { saveSession } from '@/lib/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get('username') ?? '');
    const password = String(formData.get('password') ?? '');

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: 'Invalid username or password.',
        });
        return;
      }

      const user = await response.json();
      saveSession({
        user: {
          id: user.id,
          username: user.username,
          name: user.username,
          role: user.role,
        },
      });

      toast({
        title: 'Signed in',
        description: `Welcome ${user.username}.`,
      });
      router.push('/dashboard');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: 'Cannot connect to authentication service.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border/40 bg-card/50 p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-muted-foreground">Use your admin credentials to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm">Username</label>
            <Input id="username" name="username" type="text" placeholder="sanglv" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm">Password</label>
            <Input id="password" name="password" type="password" placeholder="********" required />
          </div>
          <Button type="submit" className="w-full">Sign In</Button>
        </form>

        <p className="text-sm text-center text-muted-foreground">
          No account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
