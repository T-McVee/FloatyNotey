import PocketBase from "pocketbase";

const pb = new PocketBase(
  process.env.NEXT_PUBLIC_PB_URL || "https://api.tmcvee.com"
);

export default pb;
