import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UserInfo from './UserInfo';
import { Badge } from '@/components/ui/badge';

export default function ProfileLayout() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="p-6">
          <UserInfo />
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-2">About Me</h3>
            <p className="text-muted-foreground">Passionate frontend developer with 5 years of experience in creating dynamic and user-friendly web applications. Currently diving deep into the world of AI and looking to collaborate on exciting projects.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Skills & Interests</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Next.js', 'TypeScript', 'Python', 'LLMs', 'Figma', 'Web Accessibility'].map(skill => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">My Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Story Generator</CardTitle>
                  <CardDescription>An AI-powered tool that generates short stories.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="link" className="p-0">View Project</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>EcoTrack Dashboard</CardTitle>
                  <CardDescription>Track personal carbon footprint and promote sustainable habits.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="link" className="p-0">View Project</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Joined Communities</h3>
            <div className="space-y-2">
              <p className="text-muted-foreground">Frontend Developers Hub</p>
              <p className="text-muted-foreground">AI & Machine Learning Innovators</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
