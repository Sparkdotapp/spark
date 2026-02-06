import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Users, ArrowRight, ArrowUpRight } from 'lucide-react';
import { communities } from '../../data/mock';

interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  members: number;
  color: string;
}

interface CommunityCardProps {
  community: Community;
  index: number;
}

const CommunityCard = ({ community, index }: CommunityCardProps) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 25 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(255,255,255,0.15)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] cursor-pointer overflow-hidden"
    >
      {/* Colored top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: community.color }}
      />

      <div className="flex items-start justify-between mb-4">
        {/* Community avatar */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300 group-hover:scale-105"
          style={{ background: `${community.color}15`, color: community.color }}
        >
          {community.name.charAt(0)}
        </div>
        <ArrowUpRight className="w-4 h-4 text-[rgb(63,63,63)] group-hover:text-[rgb(218,218,218)] transition-colors duration-200" />
      </div>

      <div className="inline-block px-2.5 py-1 rounded-md text-[11px] font-medium mb-3 bg-[rgba(255,255,255,0.04)] text-[rgb(161,161,170)]">
        {community.category}
      </div>

      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#DAFF01] transition-colors duration-200">
        {community.name}
      </h3>
      <p className="text-sm text-[rgb(161,161,170)] leading-relaxed mb-4">
        {community.description}
      </p>

      <div className="flex items-center gap-2 text-sm">
        <Users className="w-4 h-4 text-[rgb(161,161,170)]" />
        <span className="text-[rgb(218,218,218)] font-medium">{community.members.toLocaleString()}</span>
        <span className="text-[rgb(161,161,170)]">members</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[rgb(161,161,170)] text-xs">Active</span>
        </span>
      </div>
    </motion.div>
  );
};

export const CommunitiesSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="communities" className="relative py-24 md:py-32">
      {/* Background accent */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(127,74,142,0.04)_0%,transparent_70%)]" />

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <span className="inline-block text-sm font-semibold text-[#DAFF01] tracking-widest uppercase mb-4">
              Community
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Find Your Tribe
            </h2>
            <p className="text-lg text-[rgb(161,161,170)] mt-3 max-w-lg">
              Join thriving communities of builders, designers, and innovators pushing the boundaries.
            </p>
          </div>
          <button className="flex items-center gap-2 text-sm font-semibold text-[rgb(218,218,218)] hover:text-[#DAFF01] transition-colors duration-200">
            Browse All Communities <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Community Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {communities.map((community: Community, i: number) => (
            <CommunityCard key={community.id} community={community} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
