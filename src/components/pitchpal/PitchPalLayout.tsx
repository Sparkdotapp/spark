import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import Link from 'next/link';
import GeneratePage from '@/app/(main)/pitchpal/generate/page';
import AnalyzePage from '@/app/(main)/pitchpal/analyze/page';

export default function PitchPalLayout() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          PitchPal
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Your AI-powered presentation assistant. Generate new pitches or get
          feedback on existing ones.
        </p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="generate" asChild>
            <Link href="/pitchpal/generate">Generate</Link>
          </TabsTrigger>
          <TabsTrigger value="analyze" asChild>
            <Link href="/pitchpal/analyze">Analyze</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generate">
          <GeneratePage />
        </TabsContent>
        <TabsContent value="analyze">
          <AnalyzePage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
