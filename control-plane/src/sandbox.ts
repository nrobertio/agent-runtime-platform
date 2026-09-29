// Sandbox launcher. Each agent step runs in an isolated Docker container:
// non-root, read-only root filesystem, no network, and CPU/memory caps.
import Docker from "dockerode";
import { config } from "./config.js";

const docker = new Docker();

export interface StepResult {
  exitCode: number;
  logs: string;
}

export async function runStep(command: string[]): Promise<StepResult> {
  const container = await docker.createContainer({
    Image: config.sandboxImage,
    Cmd: command,
    HostConfig: {
      NetworkMode: "none",        // no network egress from a step
      ReadonlyRootfs: true,        // immutable root filesystem
      Memory: 512 * 1024 * 1024,   // 512 MB cap
      NanoCpus: 1_000_000_000,     // 1 vCPU cap
      CapDrop: ["ALL"],            // drop all Linux capabilities
      PidsLimit: 128,
    },
    User: "10001",
  });

  await container.start();
  const status = await container.wait();
  const logBuf = await container.logs({ stdout: true, stderr: true });
  await container.remove({ force: true });

  return { exitCode: status.StatusCode as number, logs: logBuf.toString("utf8") };
}
