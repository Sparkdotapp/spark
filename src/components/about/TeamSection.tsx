import Image from 'next/image';

const teamMembers = [
  { name: 'Alex Johnson', role: 'Founder & CEO', image: 'https://picsum.photos/seed/alex/400/400', dataAiHint: 'professional headshot' },
  { name: 'Maria Garcia', role: 'Head of Community', image: 'https://picsum.photos/seed/maria/400/400', dataAiHint: 'woman smiling' },
  { name: 'Sam Chen', role: 'Lead Developer', image: 'https://picsum.photos/seed/sam/400/400', dataAiHint: 'man portrait' },
  { name: 'Jessica Lee', role: 'Product Designer', image: 'https://picsum.photos/seed/jessica/400/400', dataAiHint: 'person thinking' },
];

export default function TeamSection() {
  return (
    <section className="bg-card py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Meet the Team</h2>
          <p className="mt-2 text-muted-foreground">The people behind the spark.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div key={member.name} className="text-center">
              <Image
                src={member.image}
                alt={member.name}
                width={200}
                height={200}
                className="rounded-full mx-auto mb-4 object-cover"
                data-ai-hint={member.dataAiHint}
              />
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-primary">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
