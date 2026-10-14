# Regression execution note
A combined six-shard invocation exceeded the tool runtime after writing its first completed group. This is **not** counted as a complete pass. Six fresh separate shard runs each exited 0; see SHARD1.log through SHARD6.log and individual exit files. Their total was 1,128 passing TypeScript tests.
