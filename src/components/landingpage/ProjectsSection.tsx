"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, GitBranch, Trophy, ExternalLink, ArrowRight } from 'lucide-react';
import { projects, Project } from '../../data/mock';
import { Badge } from '../ui/badge';

type Language = 'TypeScript' | 'Rust' | 'Python' | 'Go' | 'JavaScript' | 'Solidity';
type ProjectType = 'all' | 'hackathon' | 'open-source';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const langColors: Record<Language, string> = {
  TypeScript: '#3178C6',
  Rust: '#DEA584',
  Python: '#3572A5',
  Go: '#00ADD8',
  JavaScript: '#F7DF1E',
  Solidity: '#AA6746',
};

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 25 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.15)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] overflow-hidden"
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#DAFF01] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(218,255,1,0.06)] flex items-center justify-center font-bold text-[#DAFF01] text-sm">
            {project.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-white group-hover:text-[#DAFF01] transition-colors duration-200">
              {project.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: langColors[project.language as Language] || '#888' }} />
              <span className="text-xs text-[rgb(161,161,170)]">{project.language}</span>
            </div>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-[rgb(63,63,63)] group-hover:text-[rgb(161,161,170)] transition-colors duration-200" />
      </div>

      {/* Award badge */}
      {project.award && (
        <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-lg bg-[rgba(218,255,1,0.06)] w-fit">
          <Trophy className="w-3.5 h-3.5 text-[#DAFF01]" />
          <span className="text-[11px] font-medium text-[#DAFF01]">{project.award}</span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-[rgb(161,161,170)] leading-relaxed mb-4">
        {project.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {project.tags.map((tag: string) => (
          <span
            key={tag}
            className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[rgba(255,255,255,0.04)] text-[rgb(161,161,170)] border border-[rgba(255,255,255,0.06)]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5 text-sm text-[rgb(161,161,170)]">
        <span className="flex items-center gap-1.5">
          <Star className="w-4 h-4" />
          {project.stars.toLocaleString()}
        </span>
        <span className="flex items-center gap-1.5">
          <GitBranch className="w-4 h-4" />
          {project.forks.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
};

export const ProjectsSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [filter, setFilter] = useState<ProjectType>('all');

  const filtered = filter === 'all'
    ? projects
    : projects.filter((p: Project) => p.type === filter);

  const filters = [
    { key: 'all', label: 'All Projects' },
    { key: 'hackathon-winner', label: 'Hackathon Winners' },
    { key: 'open-source', label: 'Open Source' },
  ];

  return (
    <section id="projects" className="relative py-24 md:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(circle,rgba(218,255,1,0.02)_0%,transparent_70%)]" />

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm font-semibold text-[#DAFF01] tracking-widest uppercase mb-4">
            Showcase
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Projects That <span className="text-[#DAFF01]">Ship</span>
          </h2>
          <p className="text-lg text-[rgb(161,161,170)] max-w-2xl mx-auto">
            Explore open-source gems and award-winning hackathon projects built by our community.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {filters.map((f: { key: string; label: string }) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as ProjectType)}
              className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                filter === f.key
                  ? 'bg-[#DAFF01] text-[rgb(17,17,19)]'
                  : 'text-[rgb(161,161,170)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project: Project, i: number) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        {/* View More */}
        <div className="text-center mt-10">
          <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border-2 border-[rgb(63,63,63)] text-white transition-all duration-200 hover:border-[#DAFF01] hover:text-[#DAFF01] hover:bg-[rgba(218,255,1,0.05)]">
            Explore All Projects <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
