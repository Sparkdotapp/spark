import { Card } from '@/components/ui/card';
import SocialIcons from './SocialIcons';

export default function SocialLayout() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Social Feed</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Follow our journey and connect with the Spark community across all our platforms.
        </p>
      </div>

      <SocialIcons />
      
      <div className="mt-20">
        <h2 className="text-3xl font-bold text-center mb-8">Unified Social Feed</h2>
        <Card className="p-8">
            <p className="text-center text-muted-foreground">
                Our unified social feed is coming soon. Stay tuned for live updates from all our platforms in one place!
            </p>
        </Card>
      </div>
    </div>
  );
}
