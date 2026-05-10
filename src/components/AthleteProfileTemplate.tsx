import { useState } from 'react';
import { MapPin, Award, Heart, Share2, Copy, CheckCircle, Play, Users, Eye, Star, Zap, Shield, Trophy } from 'lucide-react';
import type { Athlete } from '../types/athlete';

interface ApprovedMedia {
  id: string;
  media_type: string;
  public_url: string | null;
  caption: string | null;
  featured: boolean;
}

interface AthleteTag {
  visibility_tags: { id: string; slug: string; label: string } | null;
}

interface AthleteProfileTemplateProps {
  athlete: Athlete;
  onBack?: () => void;
  approvedMedia?: ApprovedMedia[];
  athleteTags?: AthleteTag[];
}

const CHECK_ICON = (
  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const SUPPORT_TIERS = [
  {
    label: 'Fan',
    price: 10,
    icon: <Heart className="w-5 h-5" />,
    color: 'border-gray-700 hover:border-sky-500',
    badgeColor: 'bg-gray-700 text-gray-200',
    buttonClass: 'bg-sky-600 hover:bg-sky-500 text-white',
    perks: [
      'Name listed on athlete profile',
      'Monthly training updates',
      'Exclusive behind-the-scenes content',
      'Fan supporter badge',
    ],
  },
  {
    label: 'Supporter',
    price: 25,
    icon: <Star className="w-5 h-5" />,
    color: 'border-sky-500 ring-1 ring-sky-500',
    badgeColor: 'bg-sky-500 text-white',
    buttonClass: 'bg-sky-500 hover:bg-sky-400 text-white',
    featured: true,
    perks: [
      'Everything in Fan',
      'Early access to highlight drops',
      'Game day shoutout',
      'Personal thank-you from athlete',
      'Supporter recognition on profile',
    ],
  },
  {
    label: 'Sponsor',
    price: 50,
    icon: <Zap className="w-5 h-5" />,
    color: 'border-gray-700 hover:border-amber-500',
    badgeColor: 'bg-amber-500 text-white',
    buttonClass: 'bg-amber-500 hover:bg-amber-400 text-white',
    perks: [
      'Everything in Supporter',
      'Featured in athlete post-season recap',
      'Priority access to events',
      'Sponsor recognition on profile',
      'Direct message access',
    ],
  },
  {
    label: 'Elite',
    price: 100,
    icon: <Trophy className="w-5 h-5" />,
    color: 'border-gray-700 hover:border-yellow-400',
    badgeColor: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black',
    buttonClass: 'bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-black font-black',
    perks: [
      'Everything in Sponsor',
      'Elite supporter status (top of profile)',
      'Signed digital highlight card',
      'Invite to exclusive NextUp events',
      'VIP access & early recruitment updates',
    ],
  },
];

function getVideoEmbedUrl(url: string) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.includes('youtu.be')
      ? url.split('youtu.be/')[1]?.split('?')[0]
      : url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('vimeo.com')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
}

export default function AthleteProfileTemplate({ athlete, onBack, approvedMedia = [], athleteTags = [] }: AthleteProfileTemplateProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPercentage = athlete.season_goal_amount > 0
    ? Math.round((athlete.season_amount_raised / athlete.season_goal_amount) * 100)
    : 0;

  const supportLink = athlete.stripe_payment_link || undefined;

  return (
    <div className="min-h-screen bg-gray-50">

      {athlete.highlight_video_embed_url && (
        <section className="bg-[#0a0e1a] pt-8 pb-0">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Athletes
              </button>
            )}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide uppercase">Highlight Reel</h2>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-2xl ring-1 ring-white/10">
              <iframe
                src={getVideoEmbedUrl(athlete.highlight_video_embed_url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${athlete.first_name}'s Highlight Reel`}
              />
            </div>
            <div className="flex items-center justify-center gap-10 py-6 border-t border-white/5 mt-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Eye className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-white">{athlete.views_count.toLocaleString()}</span>
                <span className="text-sm">Views</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-white">{athlete.supporters_count}</span>
                <span className="text-sm">Supporters</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Heart className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-white">{athlete.followers_count}</span>
                <span className="text-sm">Followers</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-navy text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {!athlete.highlight_video_embed_url && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-700">
              <img
                src={athlete.image_url || 'https://images.pexels.com/photos/2834914/pexels-photo-2834914.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={`${athlete.first_name} ${athlete.last_initial}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-sky-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {athlete.sport}
                </span>
                {athlete.is_featured && (
                  <span className="bg-amber-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>

              {athlete.city && (
                <div className="flex items-center gap-2 text-gray-400 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{athlete.city}</span>
                </div>
              )}

              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-5xl font-black leading-tight">
                  {athlete.first_name} {athlete.last_initial}
                </h1>
                {athlete.profile_tier === 'premium' && (
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    <Trophy className="w-3 h-3" />
                    Premium
                  </span>
                )}
              </div>

              <p className="text-xl text-gray-300 mb-1">
                {athlete.position} &bull; {athlete.grade}
              </p>

              {athlete.descriptor && (
                <p className="text-sky-400 font-semibold text-base mb-4">{athlete.descriptor}</p>
              )}

              {(athlete.team_name || athlete.competition_status || athlete.social_proof) && (
                <div className="mb-5 space-y-1 text-gray-300 text-sm">
                  {athlete.team_name && (
                    <p>{athlete.team_name}{athlete.team_circuit && ` — ${athlete.team_circuit}`}</p>
                  )}
                  {athlete.competition_status && <p>{athlete.competition_status}</p>}
                  {athlete.social_proof && <p className="text-sky-300">{athlete.social_proof}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {athlete.school && (
                  <div className="bg-white/10 rounded-xl px-4 py-3">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">School</p>
                    <p className="font-bold text-sm">{athlete.school}</p>
                  </div>
                )}
                {athlete.gpa && (
                  <div className="bg-white/10 rounded-xl px-4 py-3">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">GPA</p>
                    <p className="font-bold text-sm">{athlete.gpa}</p>
                  </div>
                )}
                {athlete.years_playing > 0 && (
                  <div className="bg-white/10 rounded-xl px-4 py-3">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Experience</p>
                    <p className="font-bold text-sm">{athlete.years_playing} yrs</p>
                  </div>
                )}
                <div className="bg-white/10 rounded-xl px-4 py-3">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Supporters</p>
                  <p className="font-bold text-sm">{athlete.supporters_count}</p>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-3">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Profile Views</p>
                  <p className="font-bold text-sm">{athlete.views_count.toLocaleString()}</p>
                </div>
                {athlete.monthly_funding > 0 && (
                  <div className="bg-white/10 rounded-xl px-4 py-3">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Monthly Support</p>
                    <p className="font-bold text-sm">${athlete.monthly_funding}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {supportLink ? (
                  <a
                    href={supportLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 justify-center bg-sky-500 hover:bg-sky-400 text-white font-bold px-6 py-3.5 rounded-xl w-full md:w-auto transition-all hover:shadow-[0_0_24px_rgba(14,165,233,0.4)]"
                  >
                    <Heart className="w-5 h-5" />
                    Support {athlete.first_name}'s Season
                  </a>
                ) : (
                  <button className="flex items-center gap-2 justify-center bg-sky-500 hover:bg-sky-400 text-white font-bold px-6 py-3.5 rounded-xl w-full md:w-auto transition-all">
                    <Heart className="w-5 h-5" />
                    Support {athlete.first_name}'s Season
                  </button>
                )}
                <p className="text-xs text-gray-400">
                  Help fund travel, training, and exposure opportunities
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(athlete.bio || athlete.strength || athlete.goal) && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-navy mb-8">About {athlete.first_name}</h2>
            <div className="space-y-6">
              {athlete.bio && (
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{athlete.bio}</p>
              )}
              {athlete.strength && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Biggest Strength</p>
                  <p className="text-gray-800 text-base">{athlete.strength}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {athlete.goal && (
        <section className="py-10 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-5">
              <Award className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-navy">Goals</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{athlete.goal}</p>
          </div>
        </section>
      )}

      {athleteTags.length > 0 && (
        <section className="py-10 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Character Tags</h2>
            <div className="flex flex-wrap gap-2">
              {athleteTags.map((tag, i) =>
                tag.visibility_tags ? (
                  <span
                    key={tag.visibility_tags.id ?? i}
                    className="inline-flex items-center bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    {tag.visibility_tags.label}
                  </span>
                ) : null
              )}
            </div>
          </div>
        </section>
      )}

      {approvedMedia.length > 0 && (
        <section className="py-12 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy mb-6">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {approvedMedia.map((item) => (
                <div
                  key={item.id}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden group ${item.featured ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
                >
                  {item.media_type === 'photo' && item.public_url ? (
                    <img
                      src={item.public_url}
                      alt={item.caption ?? ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <Play className="w-10 h-10 text-white/60" fill="currentColor" />
                    </div>
                  )}
                  {item.caption && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-xs font-medium leading-snug line-clamp-2">{item.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {athlete.season_goal_amount > 0 && (
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy mb-6">Season Funding Goal</h2>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Season Goal</p>
                  <p className="text-2xl font-black text-navy">${athlete.season_goal_amount.toLocaleString()}</p>
                  {athlete.next_goal_description && (
                    <p className="text-gray-500 text-sm mt-1">{athlete.next_goal_description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm mb-1">Raised</p>
                  <p className="text-3xl font-black text-sky-500">${athlete.season_amount_raised.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-sky-500 to-blue-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 text-right">{progressPercentage}% of goal reached</p>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-[#0a0e1a]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-sky-500/15 border border-sky-500/30 text-sky-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
              <Shield className="w-3.5 h-3.5" />
              Fan Engagement
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Support {athlete.first_name}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose a tier and directly fund {athlete.first_name}'s training, travel, and development.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SUPPORT_TIERS.map((tier) => (
              <div
                key={tier.label}
                className={`relative bg-[#0d1120] rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col ${tier.color} ${tier.featured ? 'shadow-[0_0_40px_rgba(14,165,233,0.2)]' : ''}`}
              >
                {tier.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-sky-500 text-white text-xs font-black uppercase tracking-wider px-4 py-1 rounded-full whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <div className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${tier.badgeColor}`}>
                    {tier.icon}
                    {tier.label}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">${tier.price}</span>
                    <span className="text-gray-500 text-sm">/mo</span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-sky-400 mt-0.5">{CHECK_ICON}</span>
                      {perk}
                    </li>
                  ))}
                </ul>

                {supportLink ? (
                  <a
                    href={supportLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-200 ${tier.buttonClass}`}
                  >
                    Join Support Team
                  </a>
                ) : (
                  <button
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-200 ${tier.buttonClass}`}
                  >
                    Join Support Team
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 text-center space-y-2">
            <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure payment powered by Stripe &bull; Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy mb-6">Share {athlete.first_name}'s Journey</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-navy rounded-lg transition-colors font-medium text-sm"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=Support ${athlete.first_name}'s journey on NextUp!`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <Share2 className="w-4 h-4" />
              Twitter / X
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <Share2 className="w-4 h-4" />
              Facebook
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy mb-6">Latest Highlights</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <a
              href="https://www.instagram.com/reel/DV4BcPgEdOk/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow block group border border-gray-100"
            >
              <div className="aspect-video bg-gradient-to-br from-pink-600 via-rose-500 to-orange-400 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 text-center text-white">
                  <Play className="w-12 h-12 mb-1 mx-auto group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold">View on Instagram</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-navy mb-1">Featured on NXTPro</h3>
                <p className="text-gray-500 text-sm">Highlight clip gaining traction (20+ shares)</p>
              </div>
            </a>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="aspect-video bg-gray-900">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Game Highlights"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-navy mb-1">Game Highlights</h3>
                <p className="text-gray-500 text-sm">Recent in-game performance</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="aspect-video bg-gray-900">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Skill Development"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-navy mb-1">Skill Development</h3>
                <p className="text-gray-500 text-sm">Training and workout clips</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
