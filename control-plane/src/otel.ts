// OpenTelemetry tracing bootstrap. Import this first so the SDK instruments
// the process before anything else loads.
import { NodeSDK } from "@opentelemetry/sdk-node";

const sdk = new NodeSDK({});

export function startTelemetry(): void {
  try {
    sdk.start();
  } catch {
    // tracing is best-effort; never block the control plane on it
  }
}
