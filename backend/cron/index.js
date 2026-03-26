
import cron from "node-cron"
import runInsightCron from "./insightsCron.js"

cron.schedule("0 */6 * * *", runInsightCron) // every 6 hours


