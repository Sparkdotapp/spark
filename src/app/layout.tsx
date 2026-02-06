import type {Metadata} from 'next';
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Spark',
  description: 'Igniting innovation and collaboration through technology, communities, and events. Spark is the hub where creators, developers, and innovators come together.',
};

const stackTheme = {
  dark: {
    primary: '#DAFF01',
    primaryForeground: '#0a0a0a',
    background: '#0a0a0a',
    foreground: '#c4c4c4',
    card: 'rgba(42, 42, 55, 0.8)',
    cardForeground: '#c4c4c4',
    popover: 'rgba(42, 42, 55, 0.95)',
    popoverForeground: '#c4c4c4',
    secondary: 'rgba(42, 42, 55, 1)',
    secondaryForeground: '#c4c4c4',
    muted: 'rgba(42, 42, 55, 0.5)',
    mutedForeground: '#999999',
    accent: '#7F4A8E',
    accentForeground: '#DAFF01',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: 'rgba(218, 255, 1, 0.2)',
    input: 'rgba(218, 255, 1, 0.2)',
    ring: '#DAFF01',
  },
  radius: '12px',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <StackProvider app={stackClientApp}>
          <StackTheme theme={stackTheme}>
            {children}
            <Toaster />
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}