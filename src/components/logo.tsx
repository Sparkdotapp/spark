import Link from 'next/link';

const SparkLogo = () => (
    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-foreground">
        <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-foreground"
        >
            <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" fill="hsl(var(--primary))" />
        </svg>
        <span>Spark</span>
    </Link>
);

export default SparkLogo;
