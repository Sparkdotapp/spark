'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  FileCheck,
  ThumbsUp,
  Lightbulb,
  Info,
  Wand2,
  Upload,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzePresentation, AnalyzePresentationOutput } from '@/ai/flows/analyze-presentation';


// ------------------
// Main Component
// ------------------
export default function AnalyzeLayout() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzePresentationOutput | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: 'No File Provided',
        description: 'Please upload your presentation as a PDF to analyze it.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64File = reader.result as string;
        try {
          const response = await analyzePresentation({ presentationPdf: base64File });
          setResult(response);
        } catch (error) {
          console.error('Error analyzing presentation:', error);
          toast({
            title: 'Error',
            description: 'Failed to analyze presentation. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        toast({
          title: 'File Read Error',
          description: 'Could not read the selected file. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      };
    } catch (error) {
        console.error('Error setting up file reader:', error);
        setIsLoading(false);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
            title: 'Invalid File Type',
            description: 'Please upload a PDF file.',
            variant: 'destructive'
        });
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  return (
    <div className="mt-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            Analyze Your Presentation
          </CardTitle>
          <CardDescription>
            Get AI-powered feedback, a score, and suggestions for improvement by uploading your presentation as a PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>How it works</AlertTitle>
              <AlertDescription>
                Upload your presentation in PDF format. Our AI will analyze the content and structure to provide a detailed review.
              </AlertDescription>
            </Alert>

          <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload Presentation (PDF)</Label>
                  <div className="flex items-center justify-center w-full">
                      <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                              {fileName ? (
                                <p className="text-sm text-foreground">{fileName}</p>
                              ) : (
                                <>
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">PDF (Max. 10MB)</p>
                                </>
                              )}
                          </div>
                          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf" disabled={isLoading} />
                      </label>
                  </div>
              </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyze} disabled={isLoading || !file}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              'Analyze Presentation'
            )}
          </Button>
        </CardFooter>
      </Card>

      {isLoading && (
         <Card className="max-w-3xl mx-auto mt-8">
            <CardContent className="pt-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-4 text-muted-foreground">Analyzing your presentation, please wait...</p>
            </CardContent>
         </Card>
      )}

      {result && (
        <Card className="max-w-3xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-primary" />
              Analysis Complete
            </CardTitle>
            <CardDescription>
              Your presentation has been scored and reviewed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Label>Overall Score</Label>
              <p className="text-6xl font-bold text-primary">
                {result.overallScore}
              </p>
              <Progress
                value={result.overallScore}
                className="w-1/2 mx-auto mt-2"
              />
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <ThumbsUp /> Overall Feedback
                </h4>
                <p className="text-muted-foreground mt-2">{result.feedback}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Lightbulb /> Slide-by-Slide Suggestions
                </h4>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  {result.slideBySlideSuggestions.map((item, index) => (
                    <li key={index} className="text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Slide {item.slideNumber}:
                      </span>{' '}
                      {item.suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
