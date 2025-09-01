import CommunityMatcher from './CommunityMatcher';
import CommunityCard from './CommunityCard';

const communities = [
  {
    name: 'Frontend Developers Hub',
    members: 2500,
    tags: ['React', 'Vue', 'Angular', 'Web Perf'],
    description: 'A community for frontend developers to share knowledge, best practices, and collaborate on projects.',
    image: 'https://picsum.photos/seed/frontend/600/400',
    dataAiHint: 'web development',
  },
  {
    name: 'AI & Machine Learning Innovators',
    members: 5000,
    tags: ['Python', 'PyTorch', 'LLMs', 'Data Science'],
    description: 'Connect with AI researchers, engineers, and enthusiasts. Discuss the latest trends and breakthroughs.',
    image: 'https://picsum.photos/seed/ai-ml/600/400',
    dataAiHint: 'artificial intelligence',
  },
  {
    name: 'UX/UI Design Guild',
    members: 1800,
    tags: ['Figma', 'User Research', 'Prototyping'],
    description: 'For designers passionate about creating beautiful and user-friendly digital experiences.',
    image: 'https://picsum.photos/seed/uidesign/600/400',
    dataAiHint: 'design thinking',
  },
];

export default function CommunitiesLayout() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Join Our Communities</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Join thriving tech communities and collaborate with like-minded individuals. Spark communities are built to grow together and learn together.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-3xl font-bold">Featured Communities</h2>
          {communities.map((community) => (
            <CommunityCard key={community.name} community={community} />
          ))}
        </div>

        <aside>
          <div className="sticky top-20">
            <h2 className="text-3xl font-bold mb-4">Find Your Community</h2>
            <CommunityMatcher />
          </div>
        </aside>
      </div>
    </div>
  );
}
