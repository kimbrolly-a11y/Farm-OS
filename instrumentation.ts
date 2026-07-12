// Next.js instrumentation hook — runs once when the server process starts.
// Boots the sensor simulator so the twin evolves even with no client open.
// Fail-safe: a boot error must never take pages down (serverless lambdas can
// lack the interval anyway — /api/state lazily catches the sim up on demand).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { startSimulator } = await import("./lib/simulator");
      startSimulator();
      const { startAutopilot } = await import("./lib/autopilot");
      startAutopilot();
    } catch (e) {
      console.error("[instrumentation] boot failed — continuing without background sim:", e);
    }
  }
}
