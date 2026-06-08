
-- Expand visibility_tags with new categories.
-- Uses INSERT ... ON CONFLICT DO NOTHING to safely skip existing slugs.

INSERT INTO visibility_tags (slug, label, category, sort_order)
VALUES
  -- Performance (100–199)
  ('lockdown-defender',   'Lockdown Defender',  'performance',     100),
  ('floor-general',       'Floor General',       'performance',     101),
  ('playmaker',           'Playmaker',           'performance',     102),
  ('high-motor',          'High Motor',          'performance',     103),
  ('shot-creator',        'Shot Creator',        'performance',     104),
  ('defensive-anchor',    'Defensive Anchor',    'performance',     105),
  ('clutch-performer',    'Clutch Performer',    'performance',     106),

  -- Academic (200–299)
  ('honor-roll',          'Honor Roll',          'academic',        200),
  ('consistent-student',  'Consistent Student',  'academic',        201),
  ('academic-achiever',   'Academic Achiever',   'academic',        202),
  ('focused-learner',     'Focused Learner',     'academic',        203),
  ('growth-mindset',      'Growth Mindset',      'academic',        204),

  -- Community (300–399)
  ('mentor',              'Mentor',              'community',       300),
  ('community-builder',   'Community Builder',   'community',       301),
  ('volunteer',           'Volunteer',           'community',       302),
  ('team-first',          'Team First',          'community',       303),
  ('positive-influence',  'Positive Influence',  'community',       304),

  -- Creative (400–499)
  ('creative-thinker',    'Creative Thinker',    'creative',        400),
  ('problem-solver',      'Problem Solver',      'creative',        401),
  ('adaptable',           'Adaptable',           'creative',        402),
  ('storyteller',         'Storyteller',         'creative',        403),
  ('visionary',           'Visionary',           'creative',        404),

  -- Leadership Role (500–599)
  ('captain',             'Captain',             'leadership_role', 500),
  ('peer-mentor',         'Peer Mentor',         'leadership_role', 501),
  ('program-leader',      'Program Leader',      'leadership_role', 502),
  ('event-organizer',     'Event Organizer',     'leadership_role', 503)

ON CONFLICT (slug) DO NOTHING;
