import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

async function main() {
  await prisma.$connect();
  const app = createApp();

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`SmartBill backend listening on ${env.BACKEND_URL}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

