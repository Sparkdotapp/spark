import { Button } from '@/components/ui/button';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Mail, Linkedin, Github } from 'lucide-react';

export default function UserInfo() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
      <Avatar className="h-24 w-24">
        <AvatarImage src="https://picsum.photos/seed/userprofile/200/200" alt="User Name" data-ai-hint="person smiling" />
        <AvatarFallback>UN</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-3xl">Jane Doe</CardTitle>
            <CardDescription>Frontend Developer | AI Enthusiast</CardDescription>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-4 text-muted-foreground">
          <a href="#" className="flex items-center gap-2 hover:text-foreground"><Mail className="h-4 w-4" /> jane.doe@spark.com</a>
          <a href="#" className="flex items-center gap-2 hover:text-foreground"><Github className="h-4 w-4" /> janedoe</a>
          <a href="#" className="flex items-center gap-2 hover:text-foreground"><Linkedin className="h-4 w-4" /> janedoe</a>
        </div>
      </div>
    </div>
  );
}
