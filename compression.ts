import sharp from "sharp";
import type { CompressOptions } from "./validators";

type SuccessResponse = [sharp.OutputInfo & { fileName: string }, null];
type ErrorResponse = [null, Error];
type Compress = SuccessResponse | ErrorResponse;

async function compress(
  image: string | ArrayBuffer,
  options: CompressOptions,
): Promise<Compress> {
  const fileName = `${Date.now().toString()}.${options.f}`;
  const promise = new Promise<Compress>((resolve, reject) => {
    sharp(image)
      .resize({ width: options.w, height: options.h, fit: "fill" })
      .toFormat(options.f)
      .toFile(`./images/${fileName}`, (err, info) => {
        if (err) {
          reject([null, err]);
          return;
        }

        resolve([{ ...info, fileName }, null]);
      });
  });

  return promise;
}

export { compress };
