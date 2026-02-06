import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { heroStats } from '../../data/mock';

interface HeroStat {
  value: string;
  label: string;
}

const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Animated grid */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `linear-gradient(rgba(218,255,1,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(218,255,1,0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    />
    {/* Radial glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(218,255,1,0.06)_0%,transparent_70%)]" />
    {/* Top-right accent */}
    <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(127,74,142,0.08)_0%,transparent_70%)]" />
    {/* Bottom-left accent */}
    <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(218,255,1,0.04)_0%,transparent_70%)]" />
  </div>
);

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-[72px] overflow-hidden">
      <GridBackground />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(218,255,1,0.08)] border border-[rgba(218,255,1,0.2)] mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#DAFF01] animate-pulse" />
            <span className="text-sm font-medium text-[#DAFF01]">Now Open for Builders</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold leading-[0.95] tracking-tight mb-6"
          >
            <span className="text-white">Where Ideas</span>
            <br />
            <span className="text-[#DAFF01] drop-shadow-[0_0_30px_rgba(218,255,1,0.3)]">Ignite</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-lg md:text-xl text-[rgb(161,161,170)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Igniting innovation and collaboration through technology, communities, and events. 
            Spark is the hub where creators, developers, and innovators come together.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button className="group relative px-8 py-4 text-base font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] transition-all duration-200 hover:bg-[rgb(166,190,21)] hover:shadow-[0_8px_30px_rgba(218,255,1,0.35)] hover:-translate-y-0.5 active:translate-y-0 overflow-hidden min-w-[200px]">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Explore Events
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            <button className="group flex items-center gap-3 px-8 py-4 text-base font-semibold rounded-xl border-2 border-[rgb(63,63,63)] text-white transition-all duration-200 hover:border-[#DAFF01] hover:text-[#DAFF01] hover:bg-[rgba(218,255,1,0.05)] hover:-translate-y-0.5 active:translate-y-0 min-w-[200px] justify-center">
              <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center group-hover:bg-[rgba(218,255,1,0.15)] transition-colors duration-200">
                <Play className="w-3.5 h-3.5 fill-current" />
              </div>
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 max-w-3xl mx-auto"
          >
            {heroStats.map((stat: HeroStat, i: number) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-[rgb(161,161,170)]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[rgb(17,17,19)] to-transparent" />
    </section>
  );
};
