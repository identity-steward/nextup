import { MapPin, Award, Target, Trophy, Instagram, Youtube, Mail } from 'lucide-react';

export interface AthleteProfileCardProps {
  athleteName: string;
  age?: number;
  grade: string;
  sport: string;
  school: string;
  city: string;
  position: string;
  bio: string;
  socialHandle?: string;
  highlightVideoUrl?: string;
  images?: string[];
  achievements?: string[];
  goals?: string[];
  stats?: {
    label: string;
    value: string;
  }[];
  contactCTA?: {
    label: string;
    action: () => void;
  };
  profileImage?: string;
}

export default function AthleteProfileCard({
  athleteName,
  age,
  grade,
  sport,
  school,
  city,
  position,
  bio,
  socialHandle,
  highlightVideoUrl,
  images = [],
  achievements = [],
  goals = [],
  stats = [],
  contactCTA,
  profileImage,
}: AthleteProfileCardProps) {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-navy via-navy-light to-navy rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-12">
          <div className="space-y-6">
            <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-lg">
              <img
                src={profileImage || 'https://images.pexels.com/photos/2834914/pexels-photo-2834914.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={athleteName}
                className="w-full h-full object-cover"
              />
            </div>

            {socialHandle && (
              <a
                href={`https://instagram.com/${socialHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gold hover:text-gold-dark transition-colors justify-center lg:justify-start"
              >
                <Instagram className="w-5 h-5" />
                <span className="font-semibold">{socialHandle}</span>
              </a>
            )}
          </div>

          <div className="text-white space-y-6">
            <div>
              <div className="flex items-center gap-2 text-gray-300 mb-3">
                <MapPin className="w-5 h-5" />
                <span>{city}</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                {athleteName}
              </h1>

              <div className="text-xl text-gold font-semibold mb-2">
                {sport} • {position}
              </div>

              <div className="text-lg text-gray-300">
                {school} • Grade {grade}
              </div>
            </div>

            {age && (
              <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-300">Age: </span>
                <span className="font-semibold text-white">{age}</span>
              </div>
            )}

            {stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gold">{stat.value}</div>
                    <div className="text-sm text-gray-300 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {highlightVideoUrl && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <Youtube className="w-7 h-7 text-gold" />
            <h2 className="text-3xl font-bold text-navy">Highlights</h2>
          </div>
          <div className="relative w-full rounded-xl overflow-hidden shadow-xl" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={highlightVideoUrl}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <div className="mt-12 bg-white rounded-xl shadow-lg p-8 lg:p-10">
        <h2 className="text-3xl font-bold text-navy mb-6">About {athleteName.split(' ')[0]}</h2>
        <p className="text-lg text-gray-700 leading-relaxed">{bio}</p>
      </div>

      {images.length > 0 && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-navy mb-6">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, index) => (
              <div key={index} className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src={image}
                  alt={`${athleteName} - ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {achievements.length > 0 && (
        <div className="mt-12 bg-gradient-to-br from-gold/10 to-gold/5 rounded-xl p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-7 h-7 text-gold" />
            <h2 className="text-3xl font-bold text-navy">Achievements</h2>
          </div>
          <ul className="space-y-3">
            {achievements.map((achievement, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-800">
                <Award className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                <span className="text-lg">{achievement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {goals.length > 0 && (
        <div className="mt-12 bg-gradient-to-br from-navy/5 to-navy/10 rounded-xl p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-7 h-7 text-navy" />
            <h2 className="text-3xl font-bold text-navy">Goals</h2>
          </div>
          <ul className="space-y-3">
            {goals.map((goal, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-800">
                <Target className="w-5 h-5 text-navy mt-1 flex-shrink-0" />
                <span className="text-lg">{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {contactCTA && (
        <div className="mt-12 bg-gradient-to-r from-gold to-gold-dark rounded-xl p-8 lg:p-10 text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">Get in Touch</h2>
          <p className="text-navy/80 mb-6 text-lg">
            Interested in connecting or supporting {athleteName.split(' ')[0]}?
          </p>
          <button
            onClick={contactCTA.action}
            className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Mail className="w-5 h-5" />
            {contactCTA.label}
          </button>
        </div>
      )}
    </div>
  );
}
