import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignupForm() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" type="text" placeholder="Jane Doe" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-signup">Email</Label>
        <Input id="email-signup" type="email" placeholder="m@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-signup">Password</Label>
        <Input id="password-signup" type="password" required />
      </div>
      <Button type="submit" className="w-full">Create Account</Button>
    </div>
  );
}
