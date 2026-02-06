"use client";
import { useState, FormEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Zap } from 'lucide-react';
import { toast } from 'sonner';

export const CTASection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [email, setEmail] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      toast.success('Welcome to SPARK! Check your email to get started.');
      setEmail('');
    }
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[rgb(26,28,30)]" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(218,255,1,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(218,255,1,0.4) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(218,255,1,0.06)_0%,transparent_60%)]" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[rgba(218,255,1,0.1)] flex items-center justify-center mx-auto mb-6">
            <Zap className="w-7 h-7 text-[#DAFF01]" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Ready to <span className="text-[#DAFF01]">Spark</span> Something?
          </h2>
          <p className="text-lg text-[rgb(161,161,170)] mb-8">
            Join 50,000+ creators, developers, and innovators already building the future together.
          </p>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 text-base rounded-xl bg-[rgb(38,40,42)] border-2 border-[rgb(63,63,63)] text-white placeholder:text-[rgb(161,161,170)] focus:outline-none focus:border-[#DAFF01] focus:shadow-[0_0_0_4px_rgba(218,255,1,0.1)] transition-all duration-200"
            />
            <button
              type="submit"
              className="group px-6 py-3.5 text-base font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] transition-all duration-200 hover:bg-[rgb(166,190,21)] hover:shadow-[0_8px_25px_rgba(218,255,1,0.3)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Join SPARK
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </form>

          <p className="text-xs text-[rgb(161,161,170)] mt-4">
            Free forever. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
