'use client';

import { useState, memo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2 } from 'lucide-react';
import { generatePresentation } from '@/ai/flows/generate-presentation';
import { type GeneratePresentationOutput } from '@/ai/flows/types/generate-presentation';
import { useToast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

/* ------------------ Form Section ------------------ */
const FormSection = memo(function FormSection({
  projectName,
  setProjectName,
  projectDescription,
  setProjectDescription,
  targetAudience,
  setTargetAudience,
  numberOfSlides,
  setNumberOfSlides,
  isLoading,
  handleGenerate,
}: any) {
  return (
    <MotionCard
      className="max-w-3xl mx-auto bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-2xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-white">
          <Wand2 className="h-6 w-6 text-blue-400" />
          Generate a New Presentation
        </CardTitle>
        <CardDescription className="text-gray-400">
          Describe your project, and our AI will generate a slide deck for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-white">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            placeholder="e.g., EcoTrack Dashboard"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            disabled={isLoading}
            className="bg-gray-800/60 border-gray-700 focus:ring-2 focus:ring-blue-500"
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
            className="bg-gray-800/60 border-gray-700 focus:ring-2 focus:ring-blue-500"
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
            className="bg-gray-800/60 border-gray-700 focus:ring-2 focus:ring-blue-500"
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
            className="accent-blue-500"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" /> Generating Pitch...
            </>
          ) : (
            'Generate Pitch'
          )}
        </Button>
      </CardFooter>
    </MotionCard>
  );
});

/* ------------------ Result Section (Dark PPT style) ------------------ */
import ReactMarkdown from "react-markdown";

const ResultSection = memo(function ResultSection({
  result,
  projectName,
}: {
  result: GeneratePresentationOutput;
  projectName: string;
}) {
  return (
    <MotionCard
      className="max-w-5xl mx-auto bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-2xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">
          Generated Presentation: {projectName}
        </CardTitle>
        <CardDescription className="text-gray-400">
          Swipe through your AI-generated slides.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Carousel className="w-full">
          <CarouselContent>
            {result.slides.map((slide, index) => (
              <CarouselItem key={index} className="p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="mx-auto aspect-[16/9] w-full bg-gray-900/90 border border-gray-700 shadow-xl rounded-xl flex flex-col justify-between overflow-hidden"
                >
                  {/* Slide Body */}
                  <div className="p-8 flex flex-col justify-center h-full">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-blue-400">
                      {index + 1}. {slide.title}
                    </h2>

                    <div className="prose prose-invert prose-lg text-gray-200 space-y-3">
                      <ReactMarkdown>{slide.content}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Speaker Notes */}
                  <div className="bg-gray-800/80 px-6 py-3 border-t border-gray-700">
                    <h4 className="font-semibold text-gray-400 text-sm mb-1">
                      Speaker Notes
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {slide.speakerNotes}
                    </p>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="-left-4 md:-left-12 bg-gray-800/70 border-gray-600 hover:bg-gray-700 text-white" />
          <CarouselNext className="-right-4 md:-right-12 bg-gray-800/70 border-gray-600 hover:bg-gray-700 text-white" />
        </Carousel>
      </CardContent>
    </MotionCard>
  );
});


/* ------------------ Main Layout ------------------ */
export default function GenerateLayout() {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [numberOfSlides, setNumberOfSlides] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratePresentationOutput | null>(null);
  const { toast } = useToast();

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
    <div className="mt-12 space-y-8">
      <FormSection
        projectName={projectName}
        setProjectName={setProjectName}
        projectDescription={projectDescription}
        setProjectDescription={setProjectDescription}
        targetAudience={targetAudience}
        setTargetAudience={setTargetAudience}
        numberOfSlides={numberOfSlides}
        setNumberOfSlides={setNumberOfSlides}
        isLoading={isLoading}
        handleGenerate={handleGenerate}
      />
      {result && <ResultSection result={result} projectName={projectName} />}
    </div>
  );
}
