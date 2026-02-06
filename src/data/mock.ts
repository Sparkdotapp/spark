import { Zap, Users, Presentation, Globe, Code2, Calendar, MapPin, Clock, Star, GitBranch, Trophy, Sparkles, MessageSquare, Rocket, Shield, Target, LucideIcon } from 'lucide-react';

// Type definitions
export interface NavLink {
  label: string;
  href: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'Hackathon' | 'Conference' | 'Workshop' | 'Meetup';
  attendees: number;
  image: string | null;
  featured: boolean;
}

export interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  members: number;
  color: string;
  active: boolean;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterLinks {
  product: FooterLink[];
  company: FooterLink[];
  resources: FooterLink[];
}

export interface Project {
  id: number;
  name: string;
  title?: string;
  description: string;
  language: 'TypeScript' | 'Rust' | 'Python' | 'Go' | 'JavaScript' | 'Solidity';
  stars: number;
  forks: number;
  tags: string[];
  type: string;
  image?: string;
  isWinner?: boolean;
  award?: string | null;
}

export interface PitchPalFeature {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export const heroStats: HeroStat[] = [
  { value: '50K+', label: 'Active Members' },
  { value: '200+', label: 'Events Hosted' },
  { value: '1.2K', label: 'Projects Shipped' },
  { value: '85+', label: 'Communities' },
];

export const features: Feature[] = [
  {
    icon: Calendar,
    title: 'Tech Events',
    description: 'Host and discover hackathons, workshops, meetups, and conferences. From intimate code jams to massive tech summits.',
    tag: 'Events',
  },
  {
    icon: MessageSquare,
    title: 'Social Hub',
    description: 'Connect with like-minded creators. Share ideas, showcase builds, and engage in meaningful tech conversations.',
    tag: 'Social',
  },
  {
    icon: Users,
    title: 'Clubs & Communities',
    description: 'Join or create communities around technologies, interests, and goals. Build your tribe of innovators.',
    tag: 'Community',
  },
  {
    icon: Presentation,
    title: 'PitchPal',
    description: 'AI-powered pitch deck analyzer. Upload your hackathon PPT and get instant feedback, scoring, and improvement suggestions.',
    tag: 'AI Tool',
  },
  {
    icon: Code2,
    title: 'Project Showcase',
    description: 'Discover open-source gems and hackathon-winning projects. Star, fork, and collaborate on cutting-edge builds.',
    tag: 'Projects',
  },
];

export const upcomingEvents: Event[] = [
  {
    id: 1,
    title: 'HackSpark 2025',
    description: 'A 48-hour global hackathon bringing together 5000+ developers to build the future of AI-native applications.',
    date: 'Sep 15-17, 2025',
    location: 'San Francisco + Virtual',
    type: 'Hackathon' as const,
    attendees: 5200,
    image: 'https://images.unsplash.com/photo-1592758080692-b6a5dbe9c725?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHx0ZWNoJTIwY29uZmVyZW5jZXxlbnwwfHx8YmxhY2t8MTc3MDM3NTA3N3ww&ixlib=rb-4.1.0&q=85&w=600',
    featured: true,
  },
  {
    id: 2,
    title: 'DevOps Summit',
    description: 'Deep dive into cloud-native architecture, Kubernetes, and modern deployment strategies with industry leaders.',
    date: 'Oct 5, 2025',
    location: 'Austin, TX',
    type: 'Conference' as const,
    attendees: 1800,
    image: null,
    featured: false,
  },
  {
    id: 3,
    title: 'AI/ML Workshop Series',
    description: 'Hands-on workshop covering transformer architectures, fine-tuning LLMs, and building production AI systems.',
    date: 'Oct 20, 2025',
    location: 'Virtual',
    type: 'Workshop' as const,
    attendees: 3400,
    image: null,
    featured: false,
  },
  {
    id: 4,
    title: 'Web3 Builders Night',
    description: 'An evening of demos, networking, and lightning talks from the most innovative Web3 builders.',
    date: 'Nov 2, 2025',
    location: 'New York, NY',
    type: 'Meetup' as const,
    attendees: 450,
    image: null,
    featured: false,
  },
];

export const communities: Community[] = [
  {
    id: 1,
    name: 'Rust Evangelists',
    description: 'For those who believe in memory safety without garbage collection.',
    members: 12400,
    category: 'Language',
    active: true,
    color: '#FF6B35',
  },
  {
    id: 2,
    name: 'AI Builders Collective',
    description: 'Ship AI products, not just models. From prototype to production.',
    members: 28900,
    category: 'AI/ML',
    active: true,
    color: '#DAFF01',
  },
  {
    id: 3,
    name: 'Open Source Defenders',
    description: 'Maintaining and growing the open-source ecosystem together.',
    members: 19200,
    category: 'Open Source',
    active: true,
    color: '#00D4FF',
  },
  {
    id: 4,
    name: 'Design Engineers',
    description: 'Where pixel-perfect design meets robust engineering.',
    members: 8700,
    category: 'Design',
    active: true,
    color: '#FF3CAC',
  },
  {
    id: 5,
    name: 'Cloud Native Guild',
    description: 'Kubernetes, serverless, and everything cloud-native.',
    members: 15600,
    category: 'DevOps',
    active: true,
    color: '#7F4A8E',
  },
  {
    id: 6,
    name: 'Blockchain Pioneers',
    description: 'Exploring decentralized tech and smart contract innovation.',
    members: 11300,
    category: 'Web3',
    active: true,
    color: '#FFB800',
  },
];

export const pitchPalFeatures: PitchPalFeature[] = [
  { icon: Target, title: 'Instant Scoring', description: 'Get a comprehensive score on clarity, design, content depth, and persuasion.' },
  { icon: Sparkles, title: 'AI Suggestions', description: 'Receive actionable feedback to strengthen your narrative and visuals.' },
  { icon: Shield, title: 'Judge Simulation', description: 'See how your pitch would perform against real hackathon judging criteria.' },
  { icon: Rocket, title: 'Presentation Coach', description: 'Timing analysis, slide flow optimization, and storytelling improvements.' },
];

export const projects: Project[] = [
  {
    id: 1,
    name: 'NeuralCanvas',
    description: 'AI-powered collaborative whiteboard that turns sketches into production-ready UI components in real-time.',
    stars: 4200,
    forks: 890,
    language: 'TypeScript',
    tags: ['AI', 'Design', 'Open Source'],
    type: 'hackathon-winner',
    award: 'HackSpark 2024 Grand Prize',
  },
  {
    id: 2,
    name: 'EdgeDB-Lite',
    description: 'A lightweight, embeddable graph database optimized for edge computing and IoT applications.',
    stars: 8900,
    forks: 1200,
    language: 'Rust',
    tags: ['Database', 'Edge Computing', 'Open Source'],
    type: 'open-source',
    award: null,
  },
  {
    id: 3,
    name: 'VoiceForge',
    description: 'Real-time voice cloning and synthesis platform with sub-100ms latency for live applications.',
    stars: 3100,
    forks: 450,
    language: 'Python',
    tags: ['AI', 'Audio', 'ML'],
    type: 'hackathon-winner',
    award: 'DevSummit 2024 Best AI',
  },
  {
    id: 4,
    name: 'FluxCI',
    description: 'Next-gen CI/CD pipeline with built-in AI test generation and intelligent deployment routing.',
    stars: 6700,
    forks: 980,
    language: 'Go',
    tags: ['DevOps', 'CI/CD', 'Open Source'],
    type: 'open-source',
    award: null,
  },
  {
    id: 5,
    name: 'PixelMorph',
    description: 'Browser-native video editor with GPU-accelerated effects and real-time collaboration features.',
    stars: 2800,
    forks: 340,
    language: 'JavaScript',
    tags: ['Video', 'WebGPU', 'Creative'],
    type: 'hackathon-winner',
    award: 'BuildWeek 2024 Winner',
  },
  {
    id: 6,
    name: 'SecureChain',
    description: 'Zero-knowledge proof toolkit for building privacy-preserving decentralized applications.',
    stars: 5400,
    forks: 720,
    language: 'Solidity',
    tags: ['Web3', 'Privacy', 'Blockchain'],
    type: 'open-source',
    award: null,
  },
];

export const footerLinks: FooterLinks = {
  product: [
    { label: 'Events', href: '#' },
    { label: 'Communities', href: '#' },
    { label: 'PitchPal', href: '#' },
    { label: 'Projects', href: '#' },
    { label: 'Social Feed', href: '#' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API', href: '#' },
    { label: 'Open Source', href: '#' },
    { label: 'Status', href: '#' },
  ],
};
