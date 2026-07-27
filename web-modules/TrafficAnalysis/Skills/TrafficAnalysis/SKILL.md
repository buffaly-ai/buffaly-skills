# TrafficAnalysis

Each action is a validated prompt workflow rather than ProtoScript business logic. The worker calls the already-installed typed data-source actions, preserves raw JSON, and uses session artifact tools to write deterministic envelopes. Every output captures the exact work prompt text and SHA-256 hash used by that run.

Collectors are independent: each catches and records only its own source failure. The aggregator consumes every available envelope and produces the presentation-neutral `intelligence-factory-traffic-email.v1` JSON view model from usable inputs. The WebModule deterministically renders that model through its separately versioned Intelligence Factory template, keeping the summary-first layout, branding, value escaping, and per-source disclosures independent from analysis prompting.
