// queues/dlq.js
const { Queue } = require("bullmq");
const { connection } = require("./queue");

const deadLetterQueue = new Queue("ai-dead-letter", {
  connection,
});

module.exports = deadLetterQueue;
