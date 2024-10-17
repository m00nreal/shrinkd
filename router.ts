import type { Server } from "bun";
import { compress } from "./compression";
import { CompressionRequestParams, getParamsAsObject } from "./validators";
import { saveImage } from "./storage";

async function router(req: Request, server: Server): Promise<Response> {
  const url = new URL(req.url);
  switch (url.pathname) {
    case "/": {
      return new Response("Not supported");
    }
    case "/optimize": {
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
    default: {
      return new Response("Not implemented");
    }
  }
}

export { router };
