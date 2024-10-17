import sharp from "sharp";
import { z } from "zod";

type formats = keyof sharp.FormatEnum;

const CompressionRequestParams = z.object({
  imgUrl: z.string(),
  w: z.number({ coerce: true }).optional(),
  h: z.number({ coerce: true }).optional(),
  q: z
    .number()
    .max(1, "Select a value between 30 and 100")
    .min(0.3, "Minimum value is 30")
    .optional(),
  f: z.custom<formats>(
    (format) => {
      return format in sharp.format ? true : false;
    },
    { message: "format not supported" },
  ),
});

const getParamsAsObject = (params: URLSearchParams): any => {
  let qp = {};
  for (let [k, v] of params.entries()) {
    qp = { ...qp, [k]: v };
  }

  return qp;
};

const toBase64 = (fileBuffer: ArrayBuffer) => {
  const binary = String.fromCharCode(...new Uint8Array(fileBuffer));
  return btoa(binary);
};

export type CompressOptions = z.infer<typeof CompressionRequestParams>;
export { CompressionRequestParams, getParamsAsObject, toBase64 };
