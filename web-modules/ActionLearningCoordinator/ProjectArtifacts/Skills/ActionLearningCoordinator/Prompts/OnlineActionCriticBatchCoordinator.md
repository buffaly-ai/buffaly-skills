# Online Action Critic Batch Coordinator

Use the shared Session Work Coordinator actions to attach an exact deterministic Online Action Critic child, reset a source-owned historical-turn manifest, and run pending turns sequentially. Preserve learned actions, revisions, and bug reports; reset only the replay manifest. Do not create an alternate worker or enable live event delivery while a batch is running.
