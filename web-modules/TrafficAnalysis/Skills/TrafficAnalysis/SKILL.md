# TrafficAnalysis

Each action is a validated prompt workflow rather than ProtoScript business logic. The worker calls the already-installed typed data-source actions, preserves raw JSON, and uses session artifact tools to write deterministic envelopes. Every output captures the exact work prompt text and SHA-256 hash used by that run.

Collectors are independent: each catches and records only its own source failure. The aggregator consumes every available envelope and always produces an email from usable inputs. The email is summary-first: its headline, executive summary, and prioritized actions stay visible, followed by semantic per-source disclosures containing status, key metrics, and evidence.
