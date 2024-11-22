import { createClient } from "redis";
import { downloadProject, uploadProjectBuild } from "./storage";
import { buildProject } from "./build";
import dotenv from "dotenv";

dotenv.config();

const subscriber = createClient();

console.log("Connecting to Redis");

(async () => {
    await subscriber.connect();

    while (true) {
        try {
            const queueItem = await subscriber.brPop("build-queue", 0);

            if (!queueItem) {
                continue;
            }

            downloadProject(queueItem.element);
            // buildProject(queueItem.element);
            // uploadProjectBuild(queueItem.element);

        } catch (error) {
            console.error("Error processing message:", error);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
})();
