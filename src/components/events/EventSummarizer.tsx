"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { summarizeEventDescription } from '@/ai/flows/dynamic-event-summaries';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EventSummarizer() {
  const [description, setDescription] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!description.trim()) {
        toast({ title: 'Error', description: 'Please enter an event description.', variant: 'destructive' });
        return;
    }
    setIsLoading(true);
    setSummary('');
    try {
      const result = await summarizeEventDescription({ eventDescription: description });
      setSummary(result.summary);
    } catch (error) {
      console.error('Error summarizing event:', error);
      toast({ title: 'Error', description: 'Failed to generate summary. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Summarizer</CardTitle>
        <CardDescription>Paste an event description to get a concise AI-powered summary.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter event description here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          disabled={isLoading}
        />
        {summary && (
          <div className="p-4 bg-muted rounded-md">
            <h4 className="font-semibold mb-2">Summary:</h4>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSummarize} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Generating...' : 'Summarize'}
        </Button>
      </CardFooter>
    </Card>
  );
}
