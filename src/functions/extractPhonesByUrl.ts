import { CheerioAPI, load } from "cheerio";
import extractContactUrls from "./extractContactUrls";
import requestUrl from "./requestUrl";

const extractPhoneByAttrs = ($: CheerioAPI) => {
  const attrs = ["tel:", "callto:"];

  for (const attr of attrs) {
    const elements = $(`[href^='${attr}']`);

    for (const element of elements) {
      const href = $(element).attr("href");
      if (href === undefined) return null;
      return href.replace(attr, "").replace(/${attr}/g, "");
    }
  }

  return null;
};

const extractPhonesByHtml = (html: string) => {
  const $ = load(html);
  const phone = extractPhoneByAttrs($);

  if (phone === null) {
    const regexs = [
      "\\W([0-9]{3})\\W*([0-9]{3})\\-\\W*([0-9]{4})(\\se?x?t?(\\d*))?",
      "\\(?\\b[2-9][0-9]{2}\\)?[-][2-9][0-9]{2}[-][0-9]{4}\\b",
      "\\(?\\b[2-9][0-9]{2}\\)?[-. ]?[2-9][0-9]{2}[-. ]?[0-9]{4}\\b",
    ];

    for (const regex of regexs) {
      const regexExp = RegExp(regex, "g");
      let execArr: RegExpExecArray | null = null;

      while ((execArr = regexExp.exec(html)) !== null) {
        return execArr[0].replace(/[^+\-()\d]/g, "");
      }
    }
  }

  return phone;
};

export default async (html: string, url: string) => {
  try {
    let phone = extractPhonesByHtml(html);
    if (phone !== null) return phone;

    const contactUrls = await extractContactUrls(html, url);
    for (const contactUrl of [...new Set(contactUrls)]) {
      const contactHtml = await requestUrl(contactUrl);
      if (contactHtml !== null) {
        phone = extractPhonesByHtml(contactHtml);
        if (phone) return phone;
      }
    }
  } catch (error: any) {
    console.error(JSON.stringify({ url, error: error?.message || error }));
  }
  return null;
};
