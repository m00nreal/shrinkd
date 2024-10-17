import { supabase } from "./database";

export const saveImage = async (fileName: string, fileBuffer: ArrayBuffer) => {
  const result = await supabase.storage
    .from(Bun.env.BUCKET_ID)
    .upload(`${fileName}`, fileBuffer, {
      contentType: "image/png",
      headers: {
        Authorization: Bun.env.SUPABASE_STORAGE_KEY,
      },
    });
  return result;
};
