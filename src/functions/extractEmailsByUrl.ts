import { CheerioAPI, load } from "cheerio";

const extractEmailsByAttrs = ($: CheerioAPI) => {
  const attrs = ["mailto:"];

  for (const attr of attrs) {
    const elements = $(`[href^='${attr}']`);

    for (const element of elements) {
      const href = $(element).attr("href");
      if (href === undefined) return null;
      const email = href.replace(attr, "").split("?")[0];
      return email;
    }
  }

  return null;
};

const extractEmailByHtml = (html: string) => {
  const $ = load(html);
  const email = extractEmailsByAttrs($);

  if (email === null) {
    const regexs: any = [/^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/];
    for (const regex of regexs) {
      const regexExp = RegExp(regex, "g");
      let execArr: RegExpExecArray | null = null;

      while ((execArr = regexExp.exec(html)) !== null) {
        return execArr[0].replace(/[^+\-()\d]/g, "");
      }
    }
  }

  return email;
};

export default async (html: string, url: string) => {
  try {
    let email = extractEmailByHtml(html);
    if (email !== null) return email;

    return null;
  } catch (error: any) {
    console.error(JSON.stringify({ url, error: error?.message || error }));
  }
};
