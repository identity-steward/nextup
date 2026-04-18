import { Mail, Twitter, Instagram, Youtube } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-navy text-gray-300 border-t-4 border-gold">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/nextup-logo.png" alt="NextUp Logo" className="w-8 h-8" />
              <span className="text-2xl font-bold text-white">NextUpMemphis</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-2">
              Youth Athlete Network
            </p>
            <p className="text-gray-400 leading-relaxed mb-6">
              Memphis, TN
            </p>
            <div className="flex items-center gap-2 text-gray-400">
              <Mail className="w-5 h-5 text-gold" />
              <a href="mailto:kenneth@flmlifestyle.com" className="hover:text-gold transition-colors">
                kenneth@flmlifestyle.com
              </a>
            </div>
          </div>

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

          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Connect</h4>
            <div className="flex gap-4 mb-6">
              <a href="#" className="w-10 h-10 bg-navy-light hover:bg-gold rounded-lg flex items-center justify-center transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-navy-light hover:bg-gold rounded-lg flex items-center justify-center transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-navy-light hover:bg-gold rounded-lg flex items-center justify-center transition-colors duration-200">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-gray-400">
              Follow us on social media for updates on Memphis youth athletes.
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
