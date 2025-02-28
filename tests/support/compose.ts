import {
  downAll,
  logs,
  ps,
  upAll,
  type IDockerComposeOptions,
} from "docker-compose";
import path from "path";

const composeFilePath = path.resolve(__dirname, "container");

const options: IDockerComposeOptions = {
  cwd: composeFilePath,
  // NOTE: enable to debug all docker compose output and container logs
  // log: true,
};

export async function testnetUp(): Promise<boolean> {
  await upAll(options);

  const targetString = "QCReady";
  console.log("waiting for logs");
  while (true) {
    const logOutput = await logs("alice", options);

    if (logOutput.out.includes(targetString)) {
      console.log("testnet started, proceeding...");
      break; // Exit the loop when the message is found
    }

    if (logOutput.out.includes("exited with code")) {
      console.log(`last logs: ${logOutput.out}`);
      throw new Error("containers exited with non zero code!");
    }

    const runs = await isComposeRunning(composeFilePath);
    if (!runs) {
      console.log(`last logs: ${logOutput.out}`);

      throw new Error("containers are not running!");
    }
    // check logs every second
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  return true;
}

export async function testnetDown() {
  await downAll(options);
}

async function isComposeRunning(path: string): Promise<boolean> {
  try {
    const result = await ps({
      cwd: path,
      commandOptions: [["--format", "json"]],
    });
    if (!result || result.data.services.length == 0) {
      console.error("[ERROR] no containers running");
      return false;
    }
    for (const service of result.data.services) {
      if (service.state != "running") {
        console.error(`[ERROR] service ${service.name} is not running`);
        return false;
      }
    }
  } catch {
    console.error("[ERROR] could not run docker-compose ps");
    return false;
  }
  return true;
}
