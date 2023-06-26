import { load } from "cheerio";
import extractPhonesByUrl from "./extractPhonesByUrl";
import requestUrl from "./requestUrl";
import validateUsaPhone from "./validateUsaPhone";
import writeCsv from "./writeCsv";

export interface ScrapedData {
  domain: string;
  title: string;
  phone: string;
}

export default async (domain: string) => {
  const initalDomain = domain;
  if (!(domain.startsWith("http://") || domain.startsWith("https://"))) {
    domain = "http://" + domain;
  }

  const html = await requestUrl(domain);
  if (!html) return;

  let phone = await extractPhonesByUrl(html, domain);

  if (!phone) {
    console.error(
      JSON.stringify({ url: domain, error: "no phone number found" })
    );
    return;
  }

  phone = validateUsaPhone(phone);

  if (!phone) {
    console.error(
      JSON.stringify({
        url: domain,
        error: "phone number filtered out by validator",
      })
    );
    return;
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
  };

  console.log(
    JSON.stringify({ domain: initalDomain, message: "Successfully scraped" })
  );

  writeCsv(data);
  return data;
};
