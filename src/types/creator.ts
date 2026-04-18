export interface Creator {
  id: string;
  first_name: string;
  last_name?: string;
  display_name: string;
  tagline: string;
  bio: string;
  location: string;
  specialties: string;
  primary_platform: string;
  portfolio_url?: string;
  instagram_handle?: string;
  image_url?: string;
  cover_image_url?: string;
  service_game_highlights: boolean;
  service_season_package: boolean;
  service_custom_story: boolean;
  is_featured: boolean;
  is_active: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface CreatorInput {
  first_name: string;
  last_name?: string;
  display_name: string;
  tagline: string;
  bio: string;
  location: string;
  specialties: string;
  primary_platform?: string;
  portfolio_url?: string;
  instagram_handle?: string;
  image_url?: string;
  cover_image_url?: string;
  service_game_highlights?: boolean;
  service_season_package?: boolean;
  service_custom_story?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  slug: string;
}
