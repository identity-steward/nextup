# AthleteProfileCard Component Documentation

## Overview

A fully reusable, production-ready React component for showcasing youth athlete profiles with a modern sports-media design. Built with TypeScript and Tailwind CSS for the NextUp platform.

## Component Location

```
src/components/AthleteProfileCard.tsx
```

## Props Interface

```typescript
interface AthleteProfileCardProps {
  athleteName: string;           // Full name of the athlete
  age?: number;                  // Age (optional)
  grade: string;                 // Grade level (e.g., "11th", "12th")
  sport: string;                 // Primary sport
  school: string;                // School name
  city: string;                  // City and state
  position: string;              // Position/role in sport
  bio: string;                   // Biography/description
  socialHandle?: string;         // Instagram handle (optional)
  highlightVideoUrl?: string;    // YouTube embed URL (optional)
  images?: string[];             // Gallery images (optional)
  achievements?: string[];       // List of achievements (optional)
  goals?: string[];              // List of goals (optional)
  stats?: {                      // Performance stats (optional)
    label: string;
    value: string;
  }[];
  contactCTA?: {                 // Contact button (optional)
    label: string;
    action: () => void;
  };
  profileImage?: string;         // Main profile image (optional)
}
```

## Features

### Core Sections
1. **Hero Header** - Gradient background with profile image and key info
2. **Highlight Video** - Embedded YouTube/Vimeo player
3. **About Section** - Biography with clean typography
4. **Gallery** - Responsive image grid
5. **Achievements** - Icon-enhanced list with gold accents
6. **Goals** - Target-focused list
7. **Contact CTA** - Prominent call-to-action button

### Design Features
- Modern sports-media aesthetic with navy and gold color scheme
- Fully responsive (mobile-first design)
- Smooth hover effects and transitions
- Gradient backgrounds and backdrop blur effects
- Icon integration (Lucide React)
- Professional shadow and elevation system

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Usage Examples

### Basic Usage

```tsx
import AthleteProfileCard from './components/AthleteProfileCard';

function MyPage() {
  return (
    <AthleteProfileCard
      athleteName="Marcus Johnson"
      grade="11th"
      sport="Basketball"
      school="Lincoln High School"
      city="Chicago, IL"
      position="Point Guard"
      bio="Dynamic point guard with exceptional court vision..."
    />
  );
}
```

### Full-Featured Usage

```tsx
import AthleteProfileCard from './components/AthleteProfileCard';

function MyPage() {
  const athlete = {
    athleteName: "Marcus Johnson",
    age: 16,
    grade: "11th",
    sport: "Basketball",
    school: "Lincoln High School",
    city: "Chicago, IL",
    position: "Point Guard",
    bio: "Dynamic point guard with exceptional court vision and leadership skills...",
    socialHandle: "@marcushoops23",
    highlightVideoUrl: "https://www.youtube.com/embed/VIDEO_ID",
    profileImage: "https://example.com/profile.jpg",
    images: [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg"
    ],
    stats: [
      { label: "PPG", value: "18.5" },
      { label: "APG", value: "7.2" },
      { label: "RPG", value: "4.1" }
    ],
    achievements: [
      "2024 All-Conference First Team",
      "District Player of the Year (2023)",
      "Led team to State Championship semifinals"
    ],
    goals: [
      "Earn Division I basketball scholarship",
      "Lead team to State Championship",
      "Improve three-point shooting to 40%+"
    ],
    contactCTA: {
      label: "Contact Marcus",
      action: () => {
        // Open contact form, modal, or navigate
        console.log("Contact clicked");
      }
    }
  };

  return <AthleteProfileCard {...athlete} />;
}
```

### With Database Integration

```tsx
import { useEffect, useState } from 'react';
import AthleteProfileCard from './components/AthleteProfileCard';
import { AthleteService } from './services/athleteService';

function AthleteProfile({ slug }: { slug: string }) {
  const [athlete, setAthlete] = useState(null);

  useEffect(() => {
    async function loadAthlete() {
      const data = await AthleteService.getAthleteBySlug(slug);
      setAthlete(data);
    }
    loadAthlete();
  }, [slug]);

  if (!athlete) return <div>Loading...</div>;

  return (
    <AthleteProfileCard
      athleteName={`${athlete.first_name} ${athlete.last_initial}`}
      grade={athlete.grade}
      sport={athlete.sport}
      school={athlete.school}
      city={athlete.city}
      position={athlete.position}
      bio={athlete.bio}
      profileImage={athlete.image_url}
      highlightVideoUrl={athlete.highlight_video_url}
      goals={[athlete.goal]}
      achievements={[athlete.strength]}
    />
  );
}
```

## Styling

The component uses Tailwind CSS with the NextUp color scheme:

### Colors
- **Navy**: `#0A2540` - Primary brand color
- **Gold**: `#F59E0B` - Accent color
- **Gray shades**: For text and backgrounds

### Custom Classes
The component leverages existing Tailwind utilities and custom classes defined in the project:
- `.btn-primary` - Gold button style
- `.btn-secondary` - Navy button style

## Image Sources

The component supports any image URL. For placeholder images, Pexels is recommended:
- Free stock photos
- Sports-themed imagery
- No attribution required for production use

Example Pexels URLs:
```
https://images.pexels.com/photos/[ID]/pexels-photo-[ID].jpeg?auto=compress&cs=tinysrgb&w=800
```

## Video Embeds

Supports embedded videos from:
- YouTube: `https://www.youtube.com/embed/VIDEO_ID`
- Vimeo: `https://player.vimeo.com/video/VIDEO_ID`

## Customization

### Adding Custom Stats
```tsx
stats={[
  { label: "Points Per Game", value: "18.5" },
  { label: "Assists", value: "7.2" },
  { label: "Rebounds", value: "4.1" },
  { label: "Field Goal %", value: "47%" }
]}
```

### Custom Contact Actions
```tsx
contactCTA={{
  label: "Send Message",
  action: () => {
    // Open modal
    setShowContactModal(true);

    // Or navigate
    navigate('/contact');

    // Or send email
    window.location.href = 'mailto:contact@example.com';
  }
}}
```

## Best Practices

1. **Images**: Use high-quality images (minimum 800px width)
2. **Bio Length**: Keep bio between 150-300 words for readability
3. **Achievements**: List 3-8 key achievements
4. **Goals**: Include 3-6 specific, measurable goals
5. **Stats**: Include 3-6 relevant performance metrics
6. **Video**: Use highlight reels under 5 minutes

## Accessibility

- Semantic HTML structure
- Alt text on all images
- Keyboard navigation support
- ARIA labels where appropriate
- High contrast ratios for text

## Demo Page

A full demo with example usage is available at:
```
src/pages/AthleteProfileDemo.tsx
```

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (icons)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
