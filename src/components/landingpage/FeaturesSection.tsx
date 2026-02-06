import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { features } from '../../data/mock';
import { Badge } from '../ui/badge';
import { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

const FeatureCard = ({ feature, index }: FeatureCardProps) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(218,255,1,0.3)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] overflow-hidden"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#DAFF01] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-[rgba(218,255,1,0.08)] flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-[rgba(218,255,1,0.15)] group-hover:shadow-[0_0_20px_rgba(218,255,1,0.15)]">
        <Icon className="w-6 h-6 text-[#DAFF01]" />
      </div>

      {/* Tag */}
      <Badge variant="outline" className="mb-4 text-[11px] font-medium border-[rgba(255,255,255,0.12)] text-[rgb(161,161,170)] bg-transparent">
        {feature.tag}
      </Badge>

      {/* Content */}
      <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
      <p className="text-[15px] leading-relaxed text-[rgb(161,161,170)]">{feature.description}</p>
    </motion.div>
  );
};

export const FeaturesSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-[#DAFF01] tracking-widest uppercase mb-4">
            Platform
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Everything You Need to
            <br className="hidden md:block" />
            <span className="text-[#DAFF01]"> Build & Connect</span>
          </h2>
          <p className="text-lg text-[rgb(161,161,170)] max-w-2xl mx-auto">
            One platform. Five powerful tools. Infinite possibilities for creators and innovators.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.slice(0, 3).map((feature: Feature, i: number) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:max-w-2xl md:mx-auto mt-6">
          {features.slice(3).map((feature: Feature, i: number) => (
            <FeatureCard key={i + 3} feature={feature} index={i + 3} />
          ))}
        </div>
      </div>
    </section>
  );
};
