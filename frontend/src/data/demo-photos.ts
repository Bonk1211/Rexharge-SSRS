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
