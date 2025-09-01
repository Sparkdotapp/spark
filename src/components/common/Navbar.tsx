"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import SparkLogo from '@/components/logo';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Events', href: '/events' },
  { name: 'Communities', href: '/communities' },
  { name: 'Projects', href: '/projects' },
  { name: 'Social', href: '/social' },
  { name: 'PitchPal', href: '/pitchpal'},
  { name: 'About Us', href: '/about' },
];

const authLinks = [
    { name: 'Profile', href: '/profile' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = (href === '/' && pathname === '/') || (href !== '/' && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {children}
      </Link>
    );
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <SparkLogo />
        </div>
        
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <div className="p-4">
                    <SparkLogo />
                    <nav className="mt-8 flex flex-col gap-4">
                        {[...navLinks, ...authLinks].map((link) => (
                            <NavLink key={link.href} href={link.href}>
                                {link.name}
                            </NavLink>
                        ))}
                         <Button asChild variant="outline">
                          <Link href="/auth">Login / Signup</Link>
                        </Button>
                    </nav>
                </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <nav className="hidden md:flex items-center gap-6 text-sm">
                  {navLinks.map((link) => (
                      <NavLink key={link.href} href={link.href}>
                          {link.name}
                      </NavLink>
                  ))}
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-4">
                <NavLink href="/profile">Profile</NavLink>
                <Button asChild>
                  <Link href="/auth">Login / Signup</Link>
                </Button>
            </div>

            <div className="md:hidden flex-1 flex justify-center">
                <SparkLogo />
            </div>
            <div className="md:hidden w-10"></div>
        </div>
      </div>
    </header>
  );
}
