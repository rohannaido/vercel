import { mkdir } from "fs/promises";
import { execSync } from "child_process";
export const buildProject = async (projectId: string) => {
    try {
        const projectPath = `${process.cwd()}/downloads/${projectId}`;
        const buildPath = `${process.cwd()}/builds/${projectId}`;

        await mkdir(buildPath, { recursive: true });

        const buildResult = execSync(`cd ${projectPath} && npm install && npm run build`);
        console.log("Project built!");

        const moveResult = execSync(`mv ${projectPath}/build/* ${buildPath}`);
        console.log("Project moved!");
    } catch (error) {
        console.error(`Error building project ${projectId}:`, error);
    }
};
