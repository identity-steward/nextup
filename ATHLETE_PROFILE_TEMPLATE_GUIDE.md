# Athlete Profile Template Guide

## Overview

The `AthleteProfileTemplate` component is a fully reusable, data-driven template for creating athlete profile pages. All content is pulled dynamically from the Supabase database.

## Component Location

```
src/components/AthleteProfileTemplate.tsx
```

## Features

The template includes:

1. **Profile Header**
   - Athlete name, position, grade
   - Location and school info
   - Profile image
   - Team name and circuit
   - Competition status
   - Social proof metrics
   - GPA display

2. **Social Sharing Section**
   - Copy link button
   - Instagram share
   - Twitter share
   - Facebook share

3. **Highlight Video Section**
   - Embedded video player (YouTube/Vimeo)
   - View count, supporters count, followers count
   - Automatically converts video URLs to embeds

4. **About & Goals Sections**
   - Full biography
   - Season goals and aspirations

5. **Fundraising Progress**
   - Season goal amount
   - Amount raised with progress bar
   - Next goal description
   - Visual percentage display

6. **Support Tiers**
   - Three pricing tiers (Supporter, Champion, Elite)
   - Stripe payment integration
   - Trust badges and security info

## Database Fields

All fields are in the `athletes` table:

### Basic Info (Required)
- `first_name` - Athlete's first name
- `last_initial` - Last initial for privacy
- `grade` - Current grade
- `sport` - Primary sport
- `position` - Position/role
- `city` - City location
- `descriptor` - 3-trait descriptor
- `bio` - Full biography
- `goal` - Season goals
- `slug` - URL-friendly identifier

### Optional Display Fields
- `school` - School name
- `gpa` - Current GPA
- `image_url` - Profile image URL

### Team & Competition (Optional)
- `team_name` - Current team/club name
- `team_circuit` - Circuit or league (e.g., "Puma Circuit")
- `competition_status` - Current competition status
- `social_proof` - Featured mentions

### Video & Stats (Optional)
- `highlight_video_embed_url` - YouTube or Vimeo URL
- `views_count` - Total highlight views
- `supporters_count` - Number of supporters
- `followers_count` - Follower count

### Fundraising (Optional)
- `season_goal_amount` - Fundraising goal in dollars
- `season_amount_raised` - Current amount raised
- `next_goal_description` - Description of next milestone
- `stripe_payment_link` - Stripe payment URL

### Social Media (Optional)
- `instagram_handle` - Instagram username
- `twitter_handle` - Twitter/X username

## How to Create a New Athlete Profile

### Step 1: Add Athlete to Database

Use the admin interface or run SQL:

```sql
INSERT INTO athletes (
  first_name,
  last_initial,
  grade,
  sport,
  position,
  city,
  school,
  descriptor,
  bio,
  goal,
  slug,
  team_name,
  team_circuit,
  competition_status,
  social_proof,
  season_goal_amount,
  season_amount_raised,
  next_goal_description,
  highlight_video_embed_url,
  image_url,
  stripe_payment_link
) VALUES (
  'Sarah',
  'M',
  '9th Grade',
  'Basketball',
  'Point Guard',
  'Memphis, TN',
  'Central High School',
  'Quick • Strategic • Leader',
  'Sarah has been playing basketball since age 7...',
  'Make varsity team, improve assist average, earn college scout attention',
  'sarah-m',
  'Memphis Lady Tigers',
  'Nike EYBL Circuit',
  'Competing in regional showcases',
  'Featured in Memphis Youth Sports (50+ followers)',
  1000,
  350,
  'Next Goal: Elite Training Camp Registration',
  'https://www.youtube.com/watch?v=VIDEO_ID',
  'https://example.com/sarah-profile.jpg',
  'https://buy.stripe.com/PAYMENT_LINK'
);
```

### Step 2: Profile is Automatically Available

The profile will be accessible at:
```
/athletes/sarah-m
```

No additional code needed - the template handles everything!

## Using the Template Component

```tsx
import AthleteProfileTemplate from '../components/AthleteProfileTemplate';
import type { Athlete } from '../types/athlete';

function MyAthleteProfile() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);

  // Load athlete from database
  useEffect(() => {
    const loadAthlete = async () => {
      const data = await AthleteService.getAthleteBySlug('athlete-slug');
      setAthlete(data);
    };
    loadAthlete();
  }, []);

  if (!athlete) return <div>Loading...</div>;

  return (
    <AthleteProfileTemplate
      athlete={athlete}
      onBack={() => navigate('/athletes')}
    />
  );
}
```

## Video URL Format

The template supports:

**YouTube:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`

**Vimeo:**
- `https://vimeo.com/VIDEO_ID`

The component automatically converts these to embeddable URLs.

## Customization Tips

### Update Pricing Tiers

Edit `src/components/AthleteProfileTemplate.tsx` lines 390-560 to modify:
- Tier names
- Pricing amounts
- Benefits lists
- Button styling

### Add More Stats

Add new fields to the database and update the template to display them.

### Styling

The template uses Tailwind CSS classes. Modify classes directly in the component for visual changes.

## Example: Complete Athlete Profile

```typescript
{
  first_name: "Marcus",
  last_initial: "J",
  grade: "10th Grade",
  sport: "Football",
  position: "Wide Receiver",
  city: "Memphis, TN",
  school: "Whitehaven High School",
  descriptor: "Fast • Explosive • Dedicated",
  bio: "Marcus has been playing football for 6 years and is known for his speed and route-running abilities. He's committed to becoming a D1 athlete.",
  goal: "Earn a Division 1 scholarship, break school receiving records, compete at the national level",
  slug: "marcus-j",
  team_name: "Memphis Elite 7v7",
  team_circuit: "Under Armour Circuit",
  competition_status: "Competing in national 7v7 tournaments",
  social_proof: "Featured on MaxPreps (100+ views)",
  season_goal_amount: 1200,
  season_amount_raised: 480,
  next_goal_description: "Next Goal: College Camp Tour & Registration",
  highlight_video_embed_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  image_url: "https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg",
  stripe_payment_link: "https://buy.stripe.com/test_XXXXXXXXXXXXX",
  views_count: 2450,
  supporters_count: 18,
  followers_count: 342,
  gpa: "3.7"
}
```

## Benefits of This Template System

1. **Consistency** - All athlete profiles have the same professional structure
2. **Scalability** - Add unlimited athletes without writing new code
3. **Maintainability** - Updates to the template affect all profiles
4. **Database-Driven** - No hardcoded content, easy to update
5. **SEO-Friendly** - Unique URLs per athlete with dynamic meta data
6. **Conversion-Optimized** - Built-in fundraising, social proof, and CTAs
7. **Mobile Responsive** - Works on all devices out of the box

## Production Checklist

Before deploying a new athlete profile:

- [ ] All required fields filled in database
- [ ] Profile image uploaded and URL added
- [ ] Highlight video URL tested and working
- [ ] Stripe payment link configured and tested
- [ ] Bio and goals are compelling and error-free
- [ ] Fundraising goals are realistic and clear
- [ ] Slug is URL-friendly and unique
- [ ] Profile tested on mobile and desktop
- [ ] Social sharing links tested
- [ ] All stats and numbers are accurate
