import { existsSync, mkdirSync } from "fs";
import { join } from "path";

(async () => {
  const dir = join(process.cwd(), ".meili");
  if (!existsSync(dir)) mkdirSync(dir, {});

  await runCmd(`docker rm -f ${process.env.MEILISEARCH_SERVICE_NAME}`);

  const cmd = `docker run -d -p ${process.env.MEILISEARCH_PORT}:7700 \
    --name=${process.env.MEILISEARCH_SERVICE_NAME} \
    -v ${dir}:/meili_data \
    -e MEILI_MASTER_KEY=${process.env.MEILISEARCH_API_KEY}\
     getmeili/meilisearch:v1.14`;

  await runCmd(cmd, { cwd: dir });

  async function runCmd(command: string, options: { cwd?: string } = {}) {
    console.log(`▶️ ${command}`);
    const proc = Bun.spawn(["bash", "-c", command], {
      stdout: "inherit",
      stderr: "inherit",
      cwd: options.cwd,
    });
    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      console.error(`❌ Erreur lors de l'exécution : ${command}`);
      process.exit(exitCode);
    }
  }
})();
