import fs from "fs";
import cluster from "cluster";
import os from "os";
import scrapeDomain from "./functions/scrapeDomain";

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

      const promises = workerUrls.map(scrapeDomain);
      const result = await Promise.all(promises);

      console.log(`Found a total of ${result.length} domains`);
      process.exit();
    }
  }
})();
