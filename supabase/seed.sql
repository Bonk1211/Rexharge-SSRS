-- Seed data ported from frontend/src/data/mock-projects.ts
-- BEFORE RUNNING: replace the owner_id placeholder below with your dev user uuid.
-- Find it in Supabase dashboard → Authentication → Users, or run:
--   select id from auth.users limit 1;

do $$
declare
  dev_owner uuid := '63f727fb-1514-4acc-9202-46df12d06093';
begin

insert into projects (id, owner_id, name, address, lat, lon, tariff, intake_mode, status,
                      captured_at, thumbnail_hue,
                      kwp, annual_kwh, annual_savings_rm, payback_years,
                      monthly_kwh, panels, planes, obstacles, capacity_factor)
values
  (
    gen_random_uuid(), dev_owner,
    'Bukit Jalil — Detached Residence',
    'L23 Jalan Akhirat, Bukit Jalil 57000 KL',
    3.0578, 101.6612, 'domestic', 'demo', 'ready',
    '2026-05-04T09:14:00+08:00', 102,
    23.56, 31240, 12810, 4.2,
    array[2620,2480,2780,2730,2640,2510,2580,2670,2700,2720,2540,2470],
    38, 2, 1, 0.151
  ),
  (
    gen_random_uuid(), dev_owner,
    'Petaling Jaya — Light-industrial Warehouse',
    'Lot 18, Sec 22 PJ 46300',
    3.0997, 101.6175, 'non_domestic_lv', 'drone_terra', 'ready',
    '2026-05-05T07:48:00+08:00', 28,
    52.08, 70360, 28930, 3.8,
    array[5980,5610,6120,6080,5940,5760,5840,5950,6010,6090,5740,5240],
    84, 4, 3, 0.154
  ),
  (
    gen_random_uuid(), dev_owner,
    'Shah Alam — Triple Shoplot',
    'Sek 13, Shah Alam 40100',
    3.0863, 101.5325, 'non_domestic_lv', 'photos', 'processing',
    '2026-05-05T13:02:00+08:00', 198,
    0, 0, 0, 0,
    array[]::numeric[], 0, 0, 0, 0
  ),
  (
    gen_random_uuid(), dev_owner,
    'Cyberjaya — 4-storey Office Block',
    'Persiaran Multimedia, 63000 Cyberjaya',
    2.918, 101.652, 'non_domestic_lv', 'drone_video', 'draft',
    '2026-05-03T16:30:00+08:00', 168,
    88.04, 118900, 51720, 3.6,
    array[10220,9540,10410,10320,10080,9770,9900,10120,10290,10360,9730,8180],
    142, 6, 5, 0.154
  ),
  (
    gen_random_uuid(), dev_owner,
    'Ipoh — Heritage Bungalow',
    'Jalan Datoh, 30000 Ipoh',
    4.5975, 101.0901, 'domestic', 'photos', 'ready',
    '2026-05-02T11:22:00+08:00', 348,
    14.26, 18650, 7180, 4.5,
    array[1620,1490,1680,1620,1570,1510,1530,1580,1610,1640,1500,1310],
    23, 3, 2, 0.149
  ),
  (
    gen_random_uuid(), dev_owner,
    'Penang — Surau Rooftop Pilot',
    'Bayan Lepas, 11900 Pulau Pinang',
    5.293, 100.275, 'non_domestic_lv', 'drone_terra', 'failed',
    '2026-05-04T15:40:00+08:00', 220,
    0, 0, 0, 0,
    array[]::numeric[], 0, 0, 0, 0
  );

end $$;
