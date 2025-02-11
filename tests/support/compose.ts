import {
  downAll,
  logs,
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

export async function testnetUp(): Promise<void> {
  await upAll(options);

  const targetString = "QCReady"; // Replace with the actual string you expect

  while (true) {
    const logOutput = await logs("alice", options);
    //       const targetString = `"event":"NewRound","reason":"QCReady"`; // Replace with the actual string you expect

    if (logOutput.out.includes(targetString)) {
      console.log("testnet started, proceeding...");
      break; // Exit the loop when the message is found
    }

    // check logs every second
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
}

export async function testnetDown() {
  await downAll(options);
}
