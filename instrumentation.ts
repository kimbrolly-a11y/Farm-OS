// Next.js instrumentation hook — runs once when the server process starts.
// Boots the sensor simulator so the twin evolves even with no client open.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startSimulator } = await import("./lib/simulator");
    startSimulator();
    const { startAutopilot } = await import("./lib/autopilot");
    startAutopilot();
  }
}
