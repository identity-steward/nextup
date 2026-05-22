export const SPORTS = [
  'Basketball',
  'Baseball',
  'Cheerleading',
  'Cross Country',
  'Floor Hockey',
  'Football',
  'Golf',
  'Lacrosse',
  'Soccer',
  'Softball',
  'Swimming',
  'Tennis',
  'Track & Field',
  'Volleyball',
  'Wrestling',
  'Other',
];

export const CURRENT_YEAR = new Date().getFullYear();
export const CLASS_YEARS = Array.from({ length: 10 }, (_, i) => String(CURRENT_YEAR + i));
