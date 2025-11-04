import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const revalidate = 0;

export const client = createClient({
  projectId: "o8ddx74t",
  dataset: "production",
  useCdn: false, // set to `false` to bypass the edge cache
  apiVersion: "2025-06-08", // use current date (YYYY-MM-DD) to target the latest API version
  token:
    "sk968WqbJ33psvFEtF6vNvByuYAt5zCuu5foq0qSTnROucnY8SG2IDb5GXFTjweKRDwXuvZ4mPT7x7AbBWnMIArFGGgizsuazspbwDautIDxo91uJu9YcYUaioo2wT4vAHKHum8luHxFl5aNxnfv6pXefKjRXtHdXsG40DWmR0v0xKByekbb",
});

const builder: ImageUrlBuilder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource): string {
  return builder.image(source).url();
}


