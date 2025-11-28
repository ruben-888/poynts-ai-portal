ARG IMAGE_VERSION="1"
ARG NODE_VERSION="22"
ARG IMAGE_VARIANT="bookworm"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${IMAGE_VERSION}-${NODE_VERSION}-${IMAGE_VARIANT}

# Install specific pnpm version
RUN npm install -g pnpm@10.10.0

# Install additional global packages
RUN npm install -g @anthropic-ai/claude-code

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_SKIP_OPTIMIZE_IMAGES=1
ENV NODE_ENV=development

WORKDIR /code

USER node

CMD [ "/bin/sh", "-c", "while sleep 1000; do :; done" ]
