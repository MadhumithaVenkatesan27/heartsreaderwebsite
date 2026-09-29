const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const { testR2Connection } = require("../services/r2Service");

const run = async () => {
  const prefix = process.argv[2] || "";
  const key = process.argv[3];
  const result = await testR2Connection({ prefix, key });

  console.log(
    JSON.stringify(
      {
        status: result.status,
        config: result.config,
        list: result.list,
        object: result.object,
      },
      null,
      2,
    ),
  );
};

run().catch((error) => {
  console.error("Cloudflare R2 connection test failed:", {
    message: error.message,
    statusCode: error.$metadata?.httpStatusCode || error.statusCode,
    code: error.Code || error.code,
  });
  process.exit(1);
});
