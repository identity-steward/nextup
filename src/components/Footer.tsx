import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const footerLinks = [
  {
    title: 'Explore',
    links: [
      { label: 'Youth Athletes', path: '/youth' },
      { label: 'Jacob Fouse', path: '/youth/jacob-fouse' },
      { label: 'Families', path: '/families' },
      { label: 'Creators', path: '/creators' },
    ],
  },
  {
    title: 'NextUp',
    links: [
      { label: 'How It Works', path: '/how-it-works' },
      { label: 'About', path: '/about' },
      { label: 'Get Started', path: '/start' },
      { label: 'Contact', path: '/contact' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', path: '/signin' },
      { label: 'Sign Up', path: '/signup' },
      { label: 'Privacy & Trust', path: '/privacy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-5">
              <Logo size="md" variant="light" />
              <p className="mt-5 text-lg font-semibold text-white leading-snug max-w-md">
                Building infrastructure. Connecting capacity. Helping opportunity flow.
              </p>
              <p className="mt-3 text-sm text-navy-300 max-w-md">
                NextUp Network helps turn what you're doing, what you need, and where you're going into a pathway toward opportunity.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {footerLinks.map((col) => (
                <div key={col.title}>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-navy-400 mb-4">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className="text-sm text-navy-200 hover:text-white transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6">
          <p className="text-xs text-navy-400 text-center">
            NextUp Network. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
