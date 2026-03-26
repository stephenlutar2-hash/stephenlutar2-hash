#!/bin/bash
set -e
export NODE_OPTIONS='--max-old-space-size=2048'
pnpm install --frozen-lockfile
pnpm --filter db push
