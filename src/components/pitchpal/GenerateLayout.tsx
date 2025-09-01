'use client';

import {useState} from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Loader2, Wand2} from 'lucide-react';
import {generatePresentation} from '@/ai/flows/generate-presentation';
import {type GeneratePresentationOutput} from '@/ai/flows/types/generate-presentation';
import {useToast} from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {Separator} from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

export default function GenerateLayout() {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [numberOfSlides, setNumberOfSlides] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratePresentationOutput | null>(
    null
  );
  const {toast} = useToast();

  const handleGenerate = async () => {
    if (!projectName || !projectDescription || !targetAudience) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all fields to generate a presentation.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generatePresentation({
        projectName,
        projectDescription,
        targetAudience,
        numberOfSlides,
      });
      setResult(response);
    } catch (error) {
      console.error('Error generating presentation:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate presentation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            Generate a New Presentation
          </CardTitle>
          <CardDescription>
            Describe your project, and our AI will generate a slide deck for
            you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="e.g., EcoTrack Dashboard"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Project Description</Label>
            <Textarea
              id="project-description"
              placeholder="Describe your project's goals, features, and target audience."
              rows={5}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-audience">Target Audience</Label>
            <Input
              id="target-audience"
              placeholder="e.g., Investors, potential users, classmates"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              disabled={isLoading}
            />
          </div>
           <div className="space-y-4">
            <Label htmlFor="slides-number">Number of Slides: {numberOfSlides}</Label>
            <Slider
              id="slides-number"
              min={3}
              max={10}
              step={1}
              value={[numberOfSlides]}
              onValueChange={(value) => setNumberOfSlides(value[0])}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" /> Generating Pitch...
              </>
            ) : (
              'Generate Pitch'
            )}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Card className="max-w-3xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Generated Presentation: {projectName}</CardTitle>
            <CardDescription>
              Here is your AI-generated slide deck.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel className="w-full">
              <CarouselContent>
                {result.slides.map((slide, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            {index + 1}. {slide.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-muted-foreground">
                              Slide Content
                            </h4>
                            <div
                              className="prose prose-sm dark:prose-invert"
                              dangerouslySetInnerHTML={{
                                __html: slide.content.replace(/\n/g, '<br />'),
                              }}
                            />
                          </div>
                          <Separator />
                          <div>
                            <h4 className="font-semibold text-muted-foreground">
                              Speaker Notes
                            </h4>
                            <p className="text-sm">{slide.speakerNotes}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4 md:-left-12" />
              <CarouselNext className="-right-4 md:-right-12" />
            </Carousel>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
