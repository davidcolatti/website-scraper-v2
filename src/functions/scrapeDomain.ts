import { load } from "cheerio";
import extractDataByUrl from "./extractDataByUrl";
import requestUrl from "./requestUrl";
import validateUsaPhone from "./validateUsaPhone";
import writeCsv from "./writeCsv";

export interface ScrapedData {
  domain: string;
  title: string;
  phone: string | null;
  email: string | null;
}

export default async (domain: string) => {
  const initalDomain = domain;
  if (!(domain.startsWith("http://") || domain.startsWith("https://"))) {
    domain = "http://" + domain;
  }

  const html = await requestUrl(domain);
  if (!html) return;

  let { phone, email } = await extractDataByUrl(html, domain);

  if (phone) {
    phone = validateUsaPhone(phone);
  }

  if (!phone && !email) {
    console.error(
      JSON.stringify({ url: domain, error: "no phone or email found" })
    );
    return;
  } else if (!phone) {
    console.error(
      JSON.stringify({
        url: domain,
        error: "phone number filtered out by validator",
      })
    );
  }

  const $ = load(html);

  const title = $("title")
    .text()
    .trim()
    .replace(/"/g, "")
    .replace("/\r\n|\n\r|\n|\r/g", "");

  const data: ScrapedData = {
    domain: initalDomain,
    title,
    phone,
    email,
  };

  console.log(
    JSON.stringify({ domain: initalDomain, message: "Successfully scraped" })
  );

  writeCsv(data);
  return data;
};
