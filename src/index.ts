import fs from "fs";
import cluster from "cluster";
import os from "os";
import scrapeDomain from "./functions/scrapeDomain";

const CHUNK_LIMIT = 400;

const forks = os.cpus().length;
const urls = fs.readFileSync(`domains.txt`).toString().split("\n");

(async () => {
  if (cluster.isPrimary) {
    console.log(`Primary: [${process.pid}] is running`);

    // create new forks
    for (let i = 0; i < forks; i++) cluster.fork();
  } else {
    if (cluster.worker !== undefined) {
      const { id: workerId } = cluster.worker;

      console.log(`Worker ${workerId}: [${process.pid}] is running`);

      const workerIndex = workerId - 1;
      const threadCount = Math.ceil(urls.length / forks);
      const startIndex = workerIndex * threadCount;

      // evenly split the urls among the different workers
      const workerUrls = urls.splice(startIndex, threadCount);

      while (workerUrls.length > 0) {
        const chunk = workerUrls.splice(0, CHUNK_LIMIT);
        const response = await Promise.all(chunk.map(scrapeDomain));
        console.log(`Chunk found a total of ${response.length} domains`);
      }

      process.exit();
    }
  }
})();
