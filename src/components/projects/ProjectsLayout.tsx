"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProjectCard from './ProjectCard';

const projects = [
  { name: 'EcoTrack Dashboard', category: 'Web App', tech: ['React', 'Node.js', 'PostgreSQL'], description: 'A web application for tracking personal carbon footprint and promoting sustainable habits.', image: 'https://picsum.photos/seed/ecotrack/600/400', dataAiHint: 'dashboard analytics' },
  { name: 'AI Story Generator', category: 'AI', tech: ['Python', 'TensorFlow', 'Next.js'], description: 'An AI-powered tool that generates short stories based on user prompts.', image: 'https://picsum.photos/seed/aistory/600/400', dataAiHint: 'robot writing' },
  { name: 'Mobile Fitness Coach', category: 'Mobile App', tech: ['React Native', 'Firebase'], description: 'A mobile app that provides personalized workout plans and tracks progress.', image: 'https://picsum.photos/seed/fitnessapp/600/400', dataAiHint: 'mobile application' },
  { name: 'DevPortfolio Template', category: 'Web App', tech: ['Astro', 'Tailwind CSS'], description: 'A sleek, customizable portfolio template for developers.', image: 'https://picsum.photos/seed/devportfolio/600/400', dataAiHint: 'portfolio website' },
  { name: 'Sentiment Analysis API', category: 'AI', tech: ['Python', 'Flask'], description: 'A REST API that analyzes the sentiment of a given text.', image: 'https://picsum.photos/seed/sentimentapi/600/400', dataAiHint: 'api code' },
  { name: 'Community Event Planner', category: 'Web App', tech: ['Next.js', 'Supabase'], description: 'A tool to help community organizers plan and manage events.', image: 'https://picsum.photos/seed/eventplanner/600/400', dataAiHint: 'planning schedule' },
];

const categories = ['All', 'Web App', 'Mobile App', 'AI'];

export default function ProjectsLayout() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'All' || project.category === selectedCategory)
  );

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Member Projects</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Explore innovative projects by Spark members. From web apps to AI solutions, see what our creators are building.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button>Submit Your Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </div>
  );
}
