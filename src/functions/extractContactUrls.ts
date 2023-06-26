import { load } from "cheerio";

export default async (html: string, url: string) => {
  const urlsSet = new Set<string>();

  const $ = load(html.toLowerCase());
  const contactElements = $("a:contains(contact)");

  for (const contactElement of contactElements) {
    let contactUrl = $(contactElement).attr("href");

    if (contactUrl !== undefined) {
      const domain = url.split("://")[1];

      if (
        !(
          contactUrl.includes(domain) ||
          contactUrl.startsWith("http://") ||
          contactUrl.startsWith("https://")
        )
      ) {
        contactUrl = contactUrl.startsWith("/")
          ? url + contactUrl
          : url + "/" + contactUrl;
      }

      urlsSet.add(contactUrl);
    }
  }

  return Array.from(urlsSet);
};
