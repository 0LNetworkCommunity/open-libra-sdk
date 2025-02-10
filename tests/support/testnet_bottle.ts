import {
  DockerComposeEnvironment,
  DownedDockerComposeEnvironment,
  StartedDockerComposeEnvironment,
  Wait,
} from "testcontainers";
import path from 'path';



export async function testnetBottle(): Promise<StartedDockerComposeEnvironment> {

  console.log("starting docker compose for local testnet ...")
  const composeFilePath = path.resolve(__dirname, "container")
  const composeFile = "compose.yml";
  return new DockerComposeEnvironment(
    composeFilePath,
    composeFile,
  )
  // TODO: figure out wait
  .withWaitStrategy("libra_alice", Wait.forLogMessage('INFO'))
  // .withWaitStrategy("alice", Wait.forHttp("v1", 8080).forStatusCode(201))
  .up();


  // TODO figure out logs
  // const alice = environment.getContainer("libra_alice");

  // // alice.
  // (await alice.logs())
  //   .on("data", (line) => console.log(line))
  //   .on("err", (line) => console.error(line))
  //   .on("end", () => console.log("Stream closed"));
}
