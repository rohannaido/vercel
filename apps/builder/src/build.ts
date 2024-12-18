import { mkdir } from "fs/promises";
import { execSync } from "child_process";
import { createClient } from "redis";
const publisher = createClient();

export const buildProject = async (projectId: string) => {
    try {
        if (!publisher.isOpen) {
            publisher.connect();
        }

        const projectPath = `${process.cwd()}/downloads/${projectId}`;
        const buildPath = `${process.cwd()}/builds/${projectId}`;

        await mkdir(buildPath, { recursive: true });

        const buildResult = execSync(`cd ${projectPath} && npm install && npm run build`, { encoding: 'utf-8' });
        await publisher.publish(`deployment:${projectId}:builder:build`, JSON.stringify({
            data: buildResult
        }));

        const moveResult = execSync(`mv ${projectPath}/build/* ${buildPath}`, { encoding: 'utf-8' });
    } catch (error) {
        console.error(`Error building project ${projectId}:`, error);
    }
};
