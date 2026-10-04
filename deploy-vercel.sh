#!/usr/bin/env bash
# Deploys both frontends to Vercel (projects: order-agent, order-agent-staff).
# Pages are served by Vercel (no ngrok warning page); API calls go to the backend through the
# shared ngrok domain with the ngrok-skip-browser-warning header.
# Usage: bash deploy-vercel.sh   (needs `npx vercel login` once)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
API_URL="${API_URL:-https://celine-patronly-uniridescently.ngrok-free.dev/order-agent/api}"
VC=(npx --yes vercel@latest)

setenv() {  # value via stdin so Git Bash can't rewrite "/" into a Windows path
  "${VC[@]}" env rm "$1" production --yes >/dev/null 2>&1 || true
  printf '%s' "$2" | "${VC[@]}" env add "$1" production >/dev/null
}

deploy() {
  local dir="$1" project="$2"
  echo "==> $project ($dir)"
  cd "$ROOT/$dir"
  "${VC[@]}" link --yes --project "$project" >/dev/null 2>&1 \
    || { "${VC[@]}" project add "$project" >/dev/null; "${VC[@]}" link --yes --project "$project" >/dev/null; }
  setenv VITE_BASE "/"
  setenv VITE_API_URL "$API_URL"
  "${VC[@]}" deploy --prod --yes 2>&1 | grep -E "https://|Error|error" | tail -2
}

deploy customer_frontend order-agent
deploy staff_frontend order-agent-staff
