import { compress } from "../compression";
import { saveImage } from "../storage";
import { getParamsAsObject, CompressionRequestParams } from "../validators";

function createImageController() {
  async function optimize(req: Request) {
    const url = new URL(req.url);
    if (req.method !== "POST") {
      return Response.json("Not allowed", { status: 405 });
    }
    const queryParams = new URLSearchParams(url.searchParams);
    const params = getParamsAsObject(queryParams);
    const validationResult = CompressionRequestParams.safeParse(params);

    if (!validationResult.success) {
      return Response.json(
        { errorMessage: "the payload provided is not valid" },

        { status: 400 },
      );
    }

    // get image and put into a buffer
    const image = await fetch(validationResult.data.imgUrl);
    const arrBuffer = await image.arrayBuffer();

    // perform image manipulation
    const [ok, err] = await compress(arrBuffer, validationResult.data);

    if (err) {
      // any kind of error that can happen during image manipulation. return internal server error
      return Response.json(
        {
          errorMessage: "something went wrong",
        },
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    await saveImage(ok.fileName, arrBuffer);

    return Response.json({ succes: true, data: ok });
  }

  return { optimize };
}

const ImageController = createImageController();

export default ImageController;
