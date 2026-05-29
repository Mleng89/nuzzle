-- seed.sql — sample locations for development
-- Run: supabase db seed

INSERT INTO locations (name, address, lat, lng, amenities, hours, notes, verified, rating_avg, rating_count)
VALUES
  (
    'Nordstrom Nursing Lounge',
    '500 5th Ave, New York, NY 10110',
    40.7549, -73.9808,
    '{"private_room","changing_table","power_outlet","sink","comfortable_seating","free_access"}',
    'Mon–Sat 9am–9pm, Sun 10am–7pm',
    'Located on Level 3 near women''s clothing. Very clean and comfortable.',
    TRUE, 4.8, 42
  ),
  (
    'Westfield World Trade Center — Family Room',
    '185 Greenwich St, New York, NY 10007',
    40.7127, -74.0134,
    '{"changing_table","power_outlet","comfortable_seating","requires_purchase"}',
    'Mon–Sat 10am–8pm, Sun 11am–6pm',
    'Level 2, near the food court. Ask customer service for access.',
    TRUE, 4.5, 18
  ),
  (
    'Whole Foods Market — Nursing Corner',
    '10 Columbus Circle, New York, NY 10019',
    40.7682, -73.9835,
    '{"changing_table","sink","free_access"}',
    'Daily 7am–10pm',
    'Near the customer service desk on the ground floor.',
    TRUE, 4.2, 9
  ),
  (
    'Target — Family Restroom',
    '517 E 117th St, New York, NY 10035',
    40.7961, -73.9349,
    '{"changing_table","free_access","wheelchair_accessible"}',
    'Daily 8am–10pm',
    NULL,
    TRUE, 3.9, 14
  ),
  (
    'Brooklyn Public Library — Parent Room',
    '10 Grand Army Plaza, Brooklyn, NY 11238',
    40.6726, -73.9686,
    '{"private_room","comfortable_seating","free_access","power_outlet"}',
    'Mon–Thu 9am–8pm, Fri–Sat 9am–6pm, Sun 1pm–5pm',
    'Room is on the second floor. No changing table but very quiet.',
    TRUE, 4.6, 27
  );
