import Link from 'next/link';
import SparkLogo from '@/components/logo';

const footerLinks = [
  { name: 'Privacy Policy', href: '#' },
  { name: 'Terms of Service', href: '#' },
  { name: 'Contact', href: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-shrink-0">
                <SparkLogo />
            </div>
            <div className="text-center text-sm text-muted-foreground">
                © 2025 Spark. All rights reserved.
            </div>
            <nav className="flex gap-4 sm:gap-6">
                {footerLinks.map((link) => (
                    <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                    {link.name}
                    </Link>
                ))}
            </nav>
        </div>
      </div>
    </footer>
  );
}
