"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { getCommunityRecommendations } from '@/ai/flows/community-recommendations';
import type { CommunityRecommendationsOutput } from '@/ai/flows/community-recommendations';
import { Loader2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const allInterests = ['React', 'Python', 'AI', 'UX/UI', 'Data Science', 'Web Development', 'Mobile Dev', 'DevOps'];
const communityProfiles = [
    { name: 'Frontend Developers Hub', description: 'A community for frontend developers...', interests: ['React', 'Web Development', 'UX/UI'], attributes: ['Technical', 'Collaborative'] },
    { name: 'AI & Machine Learning Innovators', description: 'Connect with AI researchers...', interests: ['AI', 'Python', 'Data Science'], attributes: ['Research-focused', 'Advanced'] },
    { name: 'UX/UI Design Guild', description: 'For designers passionate about creating...', interests: ['UX/UI', 'Web Development'], attributes: ['Creative', 'User-centric'] },
    { name: 'Python Programmers', description: 'A group for all things Python.', interests: ['Python', 'Data Science', 'DevOps'], attributes: ['Beginner-friendly', 'Versatile'] },
];

export default function CommunityMatcher() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [projects, setProjects] = useState('');
  const [recommendations, setRecommendations] = useState<CommunityRecommendationsOutput['recommendations']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInterestChange = (interest: string, checked: boolean) => {
    setSelectedInterests(prev =>
      checked ? [...prev, interest] : prev.filter(i => i !== interest)
    );
  };

  const handleFindCommunities = async () => {
    if (selectedInterests.length === 0 && !projects.trim()) {
        toast({ title: 'Error', description: 'Please select at least one interest or describe a project.', variant: 'destructive' });
        return;
    }
    setIsLoading(true);
    setRecommendations([]);
    try {
      const result = await getCommunityRecommendations({
        userProfile: { interests: selectedInterests, projects: projects ? [projects] : [] },
        communityProfiles: communityProfiles,
      });
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({ title: 'Error', description: 'Failed to get recommendations. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> AI Matchmaker</CardTitle>
        <CardDescription>Tell us about yourself and we'll suggest communities for you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label>Your Interests</Label>
            <div className="grid grid-cols-2 gap-2">
                {allInterests.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                        <Checkbox id={interest} onCheckedChange={(checked) => handleInterestChange(interest, !!checked)} />
                        <label htmlFor={interest} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {interest}
                        </label>
                    </div>
                ))}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="projects">Your Projects</Label>
            <Input id="projects" placeholder="e.g., a React-based portfolio" value={projects} onChange={(e) => setProjects(e.target.value)} />
        </div>
        {recommendations.length > 0 && (
          <div className="space-y-4 pt-4">
            <h4 className="font-semibold">Recommended for you:</h4>
            <div className="space-y-4">
              {recommendations.map(rec => (
                <div key={rec.name} className="p-3 bg-muted rounded-md">
                  <p className="font-semibold text-sm">{rec.name}</p>
                  <p className="text-xs text-muted-foreground">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleFindCommunities} className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Searching...' : 'Find My Communities'}
        </Button>
      </CardFooter>
    </Card>
  );
}
