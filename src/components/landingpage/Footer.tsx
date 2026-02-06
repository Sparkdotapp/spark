import { Zap, Github, Twitter, Linkedin, Youtube, LucideIcon } from 'lucide-react';
import { footerLinks } from '../../data/mock';

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  icon: LucideIcon;
  href: string;
  label: string;
}

const socialLinks: SocialLink[] = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export const Footer = () => {
  return (
    <footer className="relative bg-[rgb(26,28,30)] border-t border-[rgba(255,255,255,0.06)] mt-0">
      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#DAFF01] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[rgb(17,17,19)]" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">SPARK</span>
            </a>
            <p className="text-sm text-[rgb(161,161,170)] leading-relaxed max-w-sm mb-6">
              Igniting innovation and collaboration through technology, communities, and events. The hub where builders come together.
            </p>
            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social: SocialLink) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-[rgb(38,40,42)] flex items-center justify-center text-[rgb(161,161,170)] transition-all duration-200 hover:bg-[#DAFF01] hover:text-[rgb(17,17,19)] hover:-translate-y-0.5"
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link: FooterLink) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[rgb(161,161,170)] hover:text-[#DAFF01] transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link: FooterLink) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[rgb(161,161,170)] hover:text-[#DAFF01] transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link: FooterLink) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[rgb(161,161,170)] hover:text-[#DAFF01] transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[rgba(255,255,255,0.06)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[rgb(161,161,170)]">
            &copy; {new Date().getFullYear()} SPARK. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-[rgb(161,161,170)]">
            <a href="#" className="hover:text-white transition-colors duration-200">Privacy</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Terms</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
