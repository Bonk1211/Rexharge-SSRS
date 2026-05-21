-- 0004: add usage/tariff/thumbnail columns and replace fabricated seed
-- with the 5 real drone-photogrammetry case studies.
--
-- WARNING: the `delete` below removes ALL existing rows under dev_owner.
-- Confirm with `select id, name from projects where owner_id = '<dev_owner>';`
-- before applying. Scope tighter by name if any real customer rows live there.

alter table projects add column if not exists monthly_usage_kwh numeric;
alter table projects add column if not exists tariff_type       text;
alter table projects add column if not exists thumbnail_url     text;

do $$
declare
  dev_owner uuid := '63f727fb-1514-4acc-9202-46df12d06093';
begin
  delete from projects where owner_id = dev_owner;

  insert into projects (
    id, owner_id, name, address, lat, lon, intake_mode, status,
    captured_at, thumbnail_hue,
    kwp, annual_kwh, annual_savings_rm, payback_years,
    monthly_kwh, panels, planes, obstacles, capacity_factor,
    model_glb_path, measurement_img_path, thumbnail_url,
    monthly_usage_kwh, tariff_type
  )
  values
    ( '11111111-1111-4111-8111-111111111111', dev_owner,
      'SSU UM No.2 Electrical Substation',
      'University Malaya Campus, 50603 Kuala Lumpur',
      3.128080, 101.651010, 'drone_video', 'ready',
      '2026-05-22T10:00:00+08:00', 120,
      116.6, 162900, 33327, 13.3,
      array[13929,13750,14123,13847,13700,13472,13553,13651,13602,13439,12967,12871]::numeric[],
      188, 0, 0, 0.159,
      'https://solar.limziyang.ml/static/models/video_2/3DModel.glb',
      'https://solar.limziyang.ml/static/measurement/ssu.png',
      'https://solar.limziyang.ml/static/SSU.png',
      5000, 'commercial_lv'),

    ( '22222222-2222-4222-8222-222222222222', dev_owner,
      'Star Grocer',
      'Taman Paramount, 46000 Petaling Jaya, Selangor',
      3.106827, 101.624123, 'drone_video', 'ready',
      '2026-05-22T10:00:00+08:00', 30,
      0, 0, 0, 0, array[]::numeric[], 0, 0, 0, 0,
      'https://solar.limziyang.ml/static/models/video_5/3DModel.glb',
      'https://solar.limziyang.ml/static/measurement/star_grocer.png',
      'https://solar.limziyang.ml/static/STAR_GROCER.jpg',
      10000, 'commercial_lv'),

    ( '33333333-3333-4333-8333-333333333333', dev_owner,
      'Rainbow Recreation Center',
      'Taman Paramount, 46000 Petaling Jaya, Selangor',
      3.110072, 101.622002, 'drone_video', 'ready',
      '2026-05-22T10:00:00+08:00', 260,
      0, 0, 0, 0, array[]::numeric[], 0, 0, 0, 0,
      'https://solar.limziyang.ml/static/models/video_6/3DModel.glb',
      'https://solar.limziyang.ml/static/measurement/rainbow.png',
      'https://solar.limziyang.ml/static/RAINBOW.png',
      8000, 'commercial_lv'),

    ( '44444444-4444-4444-8444-444444444444', dev_owner,
      'Household',
      'Taman Paramount, 46000 Petaling Jaya, Selangor',
      3.108156, 101.622418, 'drone_video', 'ready',
      '2026-05-22T10:00:00+08:00', 200,
      0, 0, 0, 0, array[]::numeric[], 0, 0, 0, 0,
      'https://solar.limziyang.ml/static/models/video_4/3DModel.glb',
      'https://solar.limziyang.ml/static/measurement/household.png',
      'https://solar.limziyang.ml/static/HOUSEHOLD.png',
      600, 'domestic'),

    ( '55555555-5555-4555-8555-555555555555', dev_owner,
      'Eco Horizon',
      'Eco Horizon, Batu Kawan, 14110 Pulau Pinang',
      5.237826, 100.452277, 'drone_video', 'ready',
      '2026-05-22T10:00:00+08:00', 90,
      64.5, 90100, 3716, 65.9,
      array[7704,7604,7811,7659,7577,7451,7496,7550,7523,7433,7172,7118]::numeric[],
      104, 0, 0, 0.161,
      'https://solar.limziyang.ml/static/models/video_7/3DModel.glb',
      'https://solar.limziyang.ml/static/measurement/eco_horizon.png',
      'https://solar.limziyang.ml/static/ECO_HORIZON.PNG',
      700, 'domestic');
end $$;
