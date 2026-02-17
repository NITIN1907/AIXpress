// queues/queue.js
const { Queue } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,   // 🔥 REQUIRED FOR BULLMQ
});

connection.on("connect", () => {
  console.log("✅ Redis Connected");
});

connection.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

const aiQueue = new Queue("ai-jobs", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
     removeOnComplete: 100, 
    removeOnFail: false,
  },
});

module.exports = { aiQueue, connection };
