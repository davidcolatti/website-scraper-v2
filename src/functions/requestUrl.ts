import axios from "axios";
import https from "https";

export default async (url: string) => {
  try {
    const { data } = await axios.get<string>(url, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
    return data;
  } catch (error: any) {
    console.error(JSON.stringify({ url, error: error?.message || error }));
    return null;
  }
};
