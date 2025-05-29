import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { parseArgs } from "util";

interface IEnv {
  branch: string;
  code: string;

  domains: {
    api: string;
    client: string;
  };

  ports: {
    api: number;
    client: number;
  };

  env: {
    DB_NAME: string;
    DB_PASSWORD: string;
  };
}

(async function () {
  const { values: args } = parseArgs({
    args: Bun.argv,
    options: {
      "envs-path": {
        type: "string",
        default: join(process.cwd(), "envs.json"),
      },
    },
    strict: true,
    allowPositionals: true,
  });

  const clients: IEnv[] = await Bun.file(args["envs-path"]).json();
  for (const env of clients) {
    try {
      const tempDir = join(process.cwd(), ".tmp", env.code);

      // await cloneRepo(tempDir, env);
      // await buildEnvFile(tempDir, env);
      // await createNetwork(env);
      await buildDockerFile(tempDir, env);

      // await run(env);
    } catch (error) {
      console.log(error);
    }
  }

  async function cloneRepo(tempDir: string, env: IEnv) {
    if (existsSync(tempDir)) await runCmd(`rm -r -f ${tempDir}`);
    mkdirSync(tempDir, { recursive: true });

    const cmd = `sudo git clone -b ${env.branch} https://github.com/opensya/sya-social.git .`;
    await runCmd(cmd, { cwd: tempDir });
  }

  async function buildEnvFile(tempDir: string, env: IEnv) {
    let envFileContent = "";

    envFileContent += `ENV="production"\n`;
    envFileContent += `NODE_ENV="production"\n`;

    envFileContent += `API_URL="https://${env.domains.api}"\n`;
    envFileContent += `CLIENT_URL="https://${env.domains.client}"\n`;

    for (const key in env.env) {
      if (Object.prototype.hasOwnProperty.call(env.env, key)) {
        const value = env.env[key as "DB_NAME"];

        if (typeof value === "string") {
          envFileContent += `${key}="${value}"\n`;
        } else {
          envFileContent += `${key}=${value}\n`;
        }
      }
    }

    let apiEnvFileContent = envFileContent;
    apiEnvFileContent += `PORT=${env.ports.api}\n`;

    apiEnvFileContent += `DB_USER="postgres"\n`;
    apiEnvFileContent += `DB_HOST="sya-social-${env.code}"\n`;
    apiEnvFileContent += `DB_PORT=5432\n`;

    writeFileSync(`${tempDir}/api/.env`, apiEnvFileContent);

    let clientEnvFileContent = envFileContent;
    clientEnvFileContent += `NUXT_PUBLIC_API_URL="https://${env.domains.api}"\n`;
    clientEnvFileContent += `PORT=${env.ports.client}\n`;

    writeFileSync(`${tempDir}/client/.env`, clientEnvFileContent);
  }

  async function createNetwork(env: IEnv) {
    const networkName = `sya-social-${env.code}`;
    const list = await runCmd(`docker network inspect ${networkName}`);
    if (!JSON.parse(list).find((net: any) => net.Name === networkName)) {
      await runCmd(`docker network create -d bridge ${networkName}`);
    }
  }

  async function buildDockerFile(tempDir: string, env: IEnv) {
    let dockerCompose = await Bun.file(
      join(tempDir, "client/docker-compose.yml")
    ).text();
    dockerCompose = dockerCompose
      .replaceAll("$CONTAINER_NAME", `sya-social-${env.code}-client`)
      .replaceAll("$NETWORK", `sya-social-${env.code}`);

    writeFileSync(join(tempDir, "client/docker-compose.yml"), dockerCompose);
  }

  async function runCmd(command: string, options: { cwd?: string } = {}) {
    async function readStream(
      stream?: ReadableStream<Uint8Array>
    ): Promise<string> {
      if (!stream) return "";
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }

      return result;
    }

    console.log(`▶️ ${command}`);
    const proc = Bun.spawn(["bash", "-c", command], {
      stdout: "pipe",
      stderr: "pipe",
      cwd: options.cwd,
    });

    const [stdout, stderr] = await Promise.all([
      readStream(proc.stdout),
      readStream(proc.stderr),
    ]);

    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      console.error(`❌ Erreur lors de l'exécution : ${command}`);
      process.exit(exitCode);
    }

    return stdout.trim();
  }
})();
