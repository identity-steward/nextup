import { Mail, Instagram, Youtube, Linkedin } from 'lucide-react';

// Social links — update LinkedIn once final URL is confirmed
const SOCIALS = {
  instagram: 'https://www.instagram.com/nextupmemphis?igsh=dTg4bHg0dnVnODBv&utm_source=qr',
  youtube: 'https://youtube.com/@nextupmemphis-ip?si=LLAr7-1L8l1hqo1A',
  linkedin: 'https://www.linkedin.com/company/nextupmemphis', // placeholder — update when confirmed
};

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-navy text-gray-300 border-t-4 border-gold">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src="/NextUp_Network_logo_design.png" alt="NextUp Network Logo" className="h-10 w-auto" />
            </div>
            <p className="text-gold font-semibold text-sm leading-relaxed mb-2 italic">
              "Turning Athlete Energy Into Visibility &amp; Opportunity."
            </p>
            <p className="text-gray-400 leading-relaxed mb-1">Youth Athlete Network &middot; Memphis, TN</p>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">Founded by Kenneth Fouse</p>
            <div className="flex items-center gap-2 text-gray-400">
              <Mail className="w-4 h-4 text-gold flex-shrink-0" />
              <a href="mailto:info@NextUpMemphis.com" className="hover:text-gold transition-colors text-sm">
                info@NextUpMemphis.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => onNavigate?.('athletes')} className="hover:text-gold transition-colors duration-200 text-left">
                  View Athletes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('create')} className="hover:text-gold transition-colors duration-200 text-left">
                  Create Athlete Page
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('sponsors')} className="hover:text-gold transition-colors duration-200 text-left">
                  Sponsor
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('about')} className="hover:text-gold transition-colors duration-200 text-left">
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Follow Us</h4>
            <div className="flex gap-3 mb-5">
              <a
                href={SOCIALS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NextUp Memphis on Instagram"
                className="w-10 h-10 bg-navy-light hover:bg-gold hover:text-navy rounded-lg flex items-center justify-center transition-all duration-200"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={SOCIALS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NextUp Memphis on YouTube"
                className="w-10 h-10 bg-navy-light hover:bg-gold hover:text-navy rounded-lg flex items-center justify-center transition-all duration-200"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href={SOCIALS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NextUp Memphis on LinkedIn"
                className="w-10 h-10 bg-navy-light hover:bg-gold hover:text-navy rounded-lg flex items-center justify-center transition-all duration-200"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Follow us for updates on Memphis youth athletes, highlights, and community news.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-navy-light">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 NextUp Memphis. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
