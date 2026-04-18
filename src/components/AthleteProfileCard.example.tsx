import AthleteProfileCard from './AthleteProfileCard';

/**
 * QUICK START EXAMPLES
 * Copy and paste these examples to get started quickly
 */

// ============================================
// EXAMPLE 1: Minimal Usage (Required Props Only)
// ============================================
export function MinimalExample() {
  return (
    <AthleteProfileCard
      athleteName="Sarah Martinez"
      grade="10th"
      sport="Soccer"
      school="Westfield High School"
      city="Austin, TX"
      position="Forward"
      bio="Passionate soccer player with a love for teamwork and competition. Always striving to improve and help the team succeed."
    />
  );
}

// ============================================
// EXAMPLE 2: Basketball Player with Stats
// ============================================
export function BasketballExample() {
  return (
    <AthleteProfileCard
      athleteName="Marcus Johnson"
      age={16}
      grade="11th"
      sport="Basketball"
      school="Lincoln High School"
      city="Chicago, IL"
      position="Point Guard"
      bio="Dynamic point guard with exceptional court vision and leadership skills."
      socialHandle="@marcushoops23"
      stats={[
        { label: "PPG", value: "18.5" },
        { label: "APG", value: "7.2" },
        { label: "RPG", value: "4.1" }
      ]}
      achievements={[
        "2024 All-Conference First Team",
        "District Player of the Year (2023)"
      ]}
      goals={[
        "Earn Division I scholarship",
        "Lead team to State Championship"
      ]}
      contactCTA={{
        label: "Contact Marcus",
        action: () => alert("Contact form would open")
      }}
    />
  );
}

// ============================================
// EXAMPLE 3: Soccer Player with Video & Images
// ============================================
export function SoccerExample() {
  return (
    <AthleteProfileCard
      athleteName="Elena Rodriguez"
      age={15}
      grade="10th"
      sport="Soccer"
      school="Bay Area Academy"
      city="San Francisco, CA"
      position="Midfielder"
      bio="Creative midfielder with excellent ball control and vision. Known for setting up scoring opportunities and controlling the tempo of the game."
      socialHandle="@elenagoals10"
      highlightVideoUrl="https://www.youtube.com/embed/VIDEO_ID"
      profileImage="https://images.pexels.com/photos/1657217/pexels-photo-1657217.jpeg?auto=compress&cs=tinysrgb&w=800"
      images={[
        "https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=600"
      ]}
      stats={[
        { label: "Goals", value: "12" },
        { label: "Assists", value: "18" },
        { label: "Minutes", value: "850" }
      ]}
      achievements={[
        "Team Captain 2024",
        "League All-Star Selection",
        "15 goals + assists in 2023 season"
      ]}
      goals={[
        "Play for U.S. Youth National Team",
        "Earn college scholarship"
      ]}
    />
  );
}

// ============================================
// EXAMPLE 4: Football Player
// ============================================
export function FootballExample() {
  return (
    <AthleteProfileCard
      athleteName="James Wilson"
      age={17}
      grade="12th"
      sport="Football"
      school="Oak Ridge High"
      city="Dallas, TX"
      position="Quarterback"
      bio="Dual-threat quarterback with strong arm and mobility. Natural leader who excels under pressure and elevates teammates."
      socialHandle="@jwilson_qb1"
      stats={[
        { label: "Passing Yards", value: "2,450" },
        { label: "TD Passes", value: "28" },
        { label: "Rushing TDs", value: "12" }
      ]}
      achievements={[
        "District Offensive Player of the Year",
        "2x All-State Selection",
        "Led team to Regional Finals"
      ]}
      goals={[
        "Play Division I football",
        "Break school passing record"
      ]}
      contactCTA={{
        label: "Get in Touch",
        action: () => console.log("Contact James")
      }}
    />
  );
}

// ============================================
// EXAMPLE 5: Track & Field Athlete
// ============================================
export function TrackExample() {
  return (
    <AthleteProfileCard
      athleteName="Aisha Thompson"
      age={16}
      grade="11th"
      sport="Track & Field"
      school="Central High School"
      city="Atlanta, GA"
      position="Sprinter"
      bio="Elite sprinter specializing in 100m and 200m. Dedicated to perfecting technique and pushing limits every practice."
      stats={[
        { label: "100m PR", value: "11.8s" },
        { label: "200m PR", value: "24.2s" },
        { label: "4x100 Split", value: "11.5s" }
      ]}
      achievements={[
        "State Champion 200m (2024)",
        "Regional Record Holder",
        "3x All-State Selection"
      ]}
      goals={[
        "Break 11.5s in 100m",
        "Qualify for Junior Olympics",
        "Earn track scholarship to top D1 program"
      ]}
    />
  );
}

// ============================================
// EXAMPLE 6: Using with Form Data
// ============================================
export function DynamicExample() {
  const handleSubmit = (formData: any) => {
    return (
      <AthleteProfileCard
        athleteName={formData.name}
        age={formData.age}
        grade={formData.grade}
        sport={formData.sport}
        school={formData.school}
        city={formData.city}
        position={formData.position}
        bio={formData.bio}
        socialHandle={formData.instagram}
        highlightVideoUrl={formData.videoUrl}
        achievements={formData.achievements.split('\n')}
        goals={formData.goals.split('\n')}
      />
    );
  };

  return null;
}

// ============================================
// PROP TYPES REFERENCE
// ============================================
/**
 * Required Props:
 * - athleteName: string
 * - grade: string
 * - sport: string
 * - school: string
 * - city: string
 * - position: string
 * - bio: string
 *
 * Optional Props:
 * - age?: number
 * - socialHandle?: string
 * - highlightVideoUrl?: string
 * - images?: string[]
 * - achievements?: string[]
 * - goals?: string[]
 * - stats?: { label: string; value: string }[]
 * - contactCTA?: { label: string; action: () => void }
 * - profileImage?: string
 */
