'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, FileCheck, ThumbsUp, Lightbulb } from 'lucide-react';
import { analyzePresentation, AnalyzePresentationOutput } from '@/ai/flows/analyze-presentation';
import { motion } from 'framer-motion';

// Slide container style
const Slide = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: 'easeOut' }}
    className="w-full min-h-[70vh] flex flex-col justify-center items-center 
      bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
      rounded-3xl shadow-2xl p-12 text-white my-8 max-w-5xl mx-auto"
  >
    {children}
  </motion.div>
);

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
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a PDF file.',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  return (
    <div className="mt-8">
      {/* Upload Slide */}
      {!result && !isLoading && (
        <Slide>
          <h1 className="text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Upload Your Presentation
          </h1>
          <Label htmlFor="file-upload" className="mb-4 text-gray-300">
            Select a PDF to analyze
          </Label>
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-600 rounded-2xl cursor-pointer bg-slate-800/60 hover:bg-slate-700/70 transition"
          >
            {fileName ? (
              <p className="text-lg font-semibold">{fileName}</p>
            ) : (
              <>
                <Upload className="h-10 w-10 mb-3 text-blue-400" />
                <p className="text-gray-400">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">PDF (Max. 10MB)</p>
              </>
            )}
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf"
              disabled={isLoading}
            />
          </label>
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !file}
            className="mt-6 px-8 py-6 text-lg font-semibold rounded-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
              </>
            ) : (
              'Analyze Presentation'
            )}
          </Button>
        </Slide>
      )}

      {/* Loading Slide */}
      {isLoading && (
        <Slide>
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
          <p className="mt-6 text-gray-300 text-lg">
            Analyzing your presentation, please wait...
          </p>
        </Slide>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Overall Score Slide */}
          <Slide>
            <FileCheck className="h-12 w-12 text-green-400 mb-6" />
            <h2 className="text-4xl font-bold mb-4">Overall Score</h2>
            <p className="text-8xl font-extrabold text-green-400">{result.overallScore}</p>
            <Progress value={result.overallScore} className="w-2/3 mx-auto mt-6" />
          </Slide>

          {/* Feedback Slide */}
          <Slide>
            <ThumbsUp className="h-12 w-12 text-yellow-400 mb-6" />
            <h2 className="text-4xl font-bold mb-6">Overall Feedback</h2>
            <div className="p-6 rounded-2xl max-w-3xl text-center shadow-inner">
              <p className="text-lg text-gray-200 leading-relaxed">{result.feedback}</p>
            </div>
          </Slide>

          {/* Slide-by-Slide Suggestions */}
          {result.slideBySlideSuggestions.map((item, index) => (
            <Slide key={index}>
              <Lightbulb className="h-12 w-12 text-purple-400 mb-6" />
              <h2 className="text-3xl font-bold mb-4">Slide {item.slideNumber}</h2>
              <div className="bg-slate-800/60 p-6 rounded-2xl shadow-inner max-w-3xl text-left space-y-3">
                <p className="text-2xl text-gray-300">
                  <span className="font-semibold text-green-300">Suggestion:</span>{' '}
                  {item.suggestion}
                </p>
              </div>
            </Slide>
          ))}
        </>
      )}
    </div>
  );
}
