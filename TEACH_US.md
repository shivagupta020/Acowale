# Teach Us: Decision Records as Executable Context

Teams often write architecture decision records after a decision is made, then let them drift away from the code. A more useful pattern is to treat each important decision as executable context.

Start with a short record containing four things: the constraint, the choice, the rejected alternative, and the condition that should trigger a review. The last item is the interesting one. Instead of writing “we chose a JSON file because it is simple,” write “move to PostgreSQL when we need multiple API replicas, sustained concurrent writes, or indexed reporting.” The decision now has an expiry condition.

Put those conditions close to normal engineering signals. A pull-request template can ask whether a change crosses a recorded threshold. A lightweight script can link changed directories to relevant decisions. An AI coding assistant can be given the current decision records before planning a feature, then asked to flag conflicts rather than silently reproducing yesterday’s architecture.

This changes decision logs from historical explanation into guardrails that know when to get out of the way. It also improves AI collaboration: the assistant gets the team's reasons and boundaries, not just source code, and humans receive a clear prompt when reality has invalidated an old trade-off.

The practice is tiny, but it preserves something software teams often lose as they grow: not only what they decided, but when they intended to decide again.

