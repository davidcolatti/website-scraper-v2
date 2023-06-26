import requestUrl from "./requestUrl";
import extractContactUrls from "./extractContactUrls";
import extractPhonesByHtml from "./extractPhonesByHtml";
import extractEmailsByHtml from "./extractEmailsByHtml";

interface PhoneEmailData {
  phone: string | null;
  email: string | null;
}

export default async (html: string, url: string): Promise<PhoneEmailData> => {
  let phone = extractPhonesByHtml(html);
  let email = extractEmailsByHtml(html);

  if (phone !== null && email !== null) return { phone, email };

  try {
    const contactUrls = await extractContactUrls(html, url);
    for (const contactUrl of [...new Set(contactUrls)]) {
      const contactHtml = await requestUrl(contactUrl);
      if (contactHtml !== null) {
        phone = extractPhonesByHtml(contactHtml);
        email = extractEmailsByHtml(html);
        if (phone || email) return { phone, email };
      }
    }
  } catch (error: any) {
    console.error(JSON.stringify({ url, error: error?.message || error }));
  }
  return { phone, email };
};
