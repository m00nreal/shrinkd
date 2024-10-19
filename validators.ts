import sharp from "sharp";
import { z } from "zod";

type Formats = keyof sharp.FormatEnum;

const CompressionRequestParams = z.object({
  imgUrl: z.string(),
  width: z.number({ coerce: true }).optional(),
  height: z.number({ coerce: true }).optional(),
  quality: z
    .number()
    .max(1, "Select a value between 30 and 100")
    .min(0.3, "Minimum value is 30")
    .optional(),
  format: z.custom<Formats>(
    (format) => {
      return format in sharp.format ? true : false;
    },
    { message: "format not supported" },
  ),
});

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(15, { message: "Username cannot be longer than 15 characters" }),
  password: z
    .string()
    .length(8, { message: "Password must containt 8 characters minimum" }),
});

export type AuthRequest = z.infer<typeof RegisterSchema>;

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
