import AthleteProfileCard from '../components/AthleteProfileCard';
import AthleteIDCard from '../components/AthleteIDCard';

const exampleAthlete = {
  athleteName: "Marcus Johnson",
  age: 16,
  grade: "11th",
  sport: "Basketball",
  school: "Lincoln High School",
  city: "Chicago, IL",
  position: "Point Guard",
  bio: "Dynamic point guard with exceptional court vision and leadership skills. Known for clutch performances and ability to elevate teammates. Started varsity since freshman year and continues to develop as a complete player.",
  socialHandle: "@marcushoops23",
  profileImage: "https://images.pexels.com/photos/2834914/pexels-photo-2834914.jpeg?auto=compress&cs=tinysrgb&w=800",
  stats: [
    { label: "PPG", value: "18.5" },
    { label: "APG", value: "7.2" },
    { label: "RPG", value: "4.1" },
  ],
  achievements: [
    "2024 All-Conference First Team",
    "District Player of the Year (2023)",
    "Led team to State Championship semifinals",
  ],
  goals: [
    "Earn Division I basketball scholarship",
    "Lead team to State Championship title",
  ],
  contactCTA: {
    label: "Contact Marcus",
    action: () => alert("Contact form would open here!"),
  },
};

const idCardExample = {
  name: "Marcus Johnson",
  firstName: "Marcus",
  lastName: "Johnson",
  school: "Lincoln High School",
  city: "Chicago",
  state: "IL",
  position: "PG / SG",
  classYear: "Class of 2026",
  height: `6'1"`,
  weight: "175 lbs",
  profileImage: "https://images.pexels.com/photos/2834914/pexels-photo-2834914.jpeg?auto=compress&cs=tinysrgb&w=800",
  badges: ['verified', 'creator', 'top-prospect'] as ('verified' | 'creator' | 'top-prospect')[],
  socials: {
    instagram: "marcushoops23",
    youtube: "marcushoops",
    twitter: "marcushoops23",
  },
  stats: {
    followers: "4.2K",
    videoViews: "38K",
    offers: 3,
    points: "18.5",
  },
  onFollow: () => alert("Followed!"),
  onSupport: () => alert("Support modal would open!"),
};

export default function AthleteProfileDemo() {
  return (
    <div className="min-h-screen bg-[#070a10] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* ID Card Demo */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">New Component</p>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Athlete ID Card</h1>
            <p className="text-white/30 text-base">Digital recruiting card &mdash; reusable &amp; responsive</p>
          </div>

          {/* Card centered */}
          <div className="flex justify-center">
            <AthleteIDCard {...idCardExample} />
          </div>

          {/* Second card variant — Jacob Fouse */}
          <div className="flex justify-center mt-10">
            <AthleteIDCard
              name="Jacob Fouse"
              firstName="Jacob"
              lastName="Fouse"
              school="Memphis Area Schools"
              city="Memphis"
              state="TN"
              position="PG"
              classYear="Class of 2029"
              height={`5'8"`}
              weight="140 lbs"
              profileImage="https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=800"
              badges={['verified', 'top-prospect']}
              socials={{ instagram: "jacobfouse_hoops" }}
              stats={{
                followers: "1.1K",
                videoViews: "12K",
                offers: 0,
                points: "14.2",
              }}
              onFollow={() => alert("Following Jacob!")}
              onSupport={() => alert("Support modal!")}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-16">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-white/15 text-xs uppercase tracking-widest font-bold">Legacy Profile Card</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        {/* Legacy card */}
        <AthleteProfileCard {...exampleAthlete} />
      </div>
    </div>
  );
}
