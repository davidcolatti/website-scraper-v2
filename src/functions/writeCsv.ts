import fs from "fs";
import makeCsvWriteStream, { CsvWriteStream } from "csv-write-stream";
import { ScrapedData } from "./scrapeDomain";

type Headers = Array<keyof ScrapedData>;

export default (data: ScrapedData) => {
  const filePath = "./output.csv";
  const headers: Headers = ["domain", "title", "phone"];

  let writer: CsvWriteStream;
  if (!fs.existsSync(filePath)) {
    writer = makeCsvWriteStream({ headers });
  } else {
    writer = makeCsvWriteStream({ sendHeaders: false });
  }

  writer.pipe(fs.createWriteStream(filePath, { flags: "a" }));
  writer.write(data);

  writer.end();
};
