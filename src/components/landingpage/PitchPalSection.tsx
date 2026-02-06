"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Upload, FileText, ArrowRight, Check } from 'lucide-react';
import { pitchPalFeatures } from '../../data/mock';

export const PitchPalSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [isDragging, setIsDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleUploadClick = () => {
    setUploaded(true);
    setTimeout(() => setUploaded(false), 3000);
  };

  return (
    <section id="pitchpal" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(218,255,1,0.03)_0%,transparent_70%)]" />

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-sm font-semibold text-[#DAFF01] tracking-widest uppercase mb-4">
              AI-Powered
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
              PitchPal
            </h2>
            <p className="text-lg text-[rgb(161,161,170)] leading-relaxed mb-8 max-w-lg">
              Upload your hackathon pitch deck and get AI-driven analysis, scoring, and actionable suggestions to win.
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {pitchPalFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    className="flex gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[rgba(218,255,1,0.08)] flex items-center justify-center flex-shrink-0">
                      {Icon && <Icon className="w-4.5 h-4.5 text-[#DAFF01]" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                      <p className="text-xs text-[rgb(161,161,170)] leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Upload Zone */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
                isDragging
                  ? 'border-[#DAFF01] bg-[rgba(218,255,1,0.06)]'
                  : uploaded
                  ? 'border-[#22C55E] bg-[rgba(34,197,94,0.06)]'
                  : 'border-[rgb(63,63,63)] bg-[rgb(26,28,30)] hover:border-[rgba(218,255,1,0.3)] hover:bg-[rgba(218,255,1,0.02)]'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUploadClick(); }}
            >
              {uploaded ? (
                <div className="py-6">
                  <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.12)] flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-[#22C55E]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Uploaded Successfully!</h3>
                  <p className="text-sm text-[rgb(161,161,170)]">Analyzing your pitch deck...</p>
                </div>
              ) : (
                <div className="py-6">
                  <div className="w-16 h-16 rounded-2xl bg-[rgba(218,255,1,0.08)] flex items-center justify-center mx-auto mb-5">
                    <Upload className={`w-7 h-7 text-[#DAFF01] transition-transform duration-200 ${isDragging ? 'scale-110' : ''}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Drop your pitch deck here</h3>
                  <p className="text-sm text-[rgb(161,161,170)] mb-5">Support for PPT, PPTX, PDF up to 50MB</p>
                  <button
                    onClick={handleUploadClick}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] transition-all duration-200 hover:bg-[rgb(166,190,21)] hover:shadow-[0_8px_25px_rgba(218,255,1,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <FileText className="w-4 h-4" />
                    Upload File
                  </button>
                </div>
              )}

              {/* Decorative corners */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[rgba(218,255,1,0.3)] rounded-tl-sm" />
              <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[rgba(218,255,1,0.3)] rounded-tr-sm" />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[rgba(218,255,1,0.3)] rounded-bl-sm" />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[rgba(218,255,1,0.3)] rounded-br-sm" />
            </div>

            {/* Score Preview */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-5 grid grid-cols-3 gap-3"
            >
              {[{ label: 'Clarity', score: 92 }, { label: 'Design', score: 87 }, { label: 'Impact', score: 95 }].map((item, i) => (
                <div key={i} className="bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{item.score}</div>
                  <div className="text-xs text-[rgb(161,161,170)]">{item.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
