export interface DemoPhotoRef {
  name: string;
  url: string;
}

const SAMPLE_HOUSE_3_FILES = [
  "2569-04-06-13-44-24-837.PNG",
  "2569-04-06-13-44-28-046.PNG",
  "2569-04-06-13-44-50-035.PNG",
  "2569-04-06-13-45-18-821.PNG",
  "2569-04-06-13-46-13-609.PNG",
  "2569-04-06-13-46-21-566.PNG",
  "2569-04-06-13-46-24-196.PNG",
  "2569-04-06-13-46-27-902.PNG",
  "2569-04-06-13-46-51-333.PNG",
  "2569-04-06-13-47-19-062.PNG",
  "2569-04-06-13-47-21-346.PNG",
] as const;

export const DEMO_PHOTO_SET_SAMPLE_HOUSE_3: DemoPhotoRef[] = SAMPLE_HOUSE_3_FILES.map(
  (name) => ({
    name,
    url: `/demo-photos/sample-house-3/${name}`,
  }),
);

const SAMPLE_HOUSE_4_FILES = [
  "1f98dd24-1dad-4055-8a12-7f28eeddc35c.jpg",
  "88e11f70-1325-4102-abbf-dd9d346a5e96.jpg",
  "8a6566f8-3622-45ea-87ec-67f2ef64d98c.jpg",
  "af0ea364-d595-4af2-bcf3-03b1d26921a3.jpg",
  "bd8427cb-62ed-498f-b103-b1c40a0e182f.jpg",
] as const;

export const DEMO_PHOTO_SET_SAMPLE_HOUSE_4: DemoPhotoRef[] = SAMPLE_HOUSE_4_FILES.map(
  (name) => ({
    name,
    url: `/demo-photos/sample-house-4/${name}`,
  }),
);

export async function loadDemoPhotoFiles(refs: DemoPhotoRef[]): Promise<File[]> {
  return Promise.all(
    refs.map(async (ref) => {
      const res = await fetch(ref.url);
      if (!res.ok) throw new Error(`Failed to fetch ${ref.name}: ${res.status}`);
      const blob = await res.blob();
      return new File([blob], ref.name, { type: blob.type || "image/png" });
    }),
  );
}
