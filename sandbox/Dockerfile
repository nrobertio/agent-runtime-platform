# Locked-down execution sandbox for a single agent step.
# Non-root, read-only root filesystem enforced at runtime, no shell tricks.
FROM node:20-slim

RUN useradd -u 10001 -m runner
USER 10001
WORKDIR /work

# The agent step code is mounted in at run time; this image only provides
# a minimal, unprivileged runtime. Network is disabled by the launcher.
ENTRYPOINT ["node"]
