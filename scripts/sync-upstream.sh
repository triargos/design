#!/usr/bin/env bash
# Snapshots the design system from the elternportal repo into the `upstream` branch, then merges it into the current
# branch. Git's 3-way merge carries upstream changes into our decoupled copy; conflicts are ours to resolve.
#
#   scripts/sync-upstream.sh [elternportal-dir]   default: ~/code/elternportal-feat-storybook (its working tree)
#   scripts/sync-upstream.sh --snapshot-only DIR  only commit the snapshot to `upstream`, no merge
set -euo pipefail

snapshot_only=false
if [[ "${1:-}" == "--snapshot-only" ]]; then
  snapshot_only=true
  shift
fi

source_dir="$(cd "${1:-$HOME/code/elternportal-feat-storybook}" && pwd)"
repo="$(git rev-parse --show-toplevel)"
worktree="$repo/.upstream"
app="$source_dir/apps/dashboard"

if [[ ! -d "$worktree" ]]; then
  git -C "$repo" worktree add --quiet "$worktree" upstream
fi

# elternportal path → this repo's path. Directories are mirrored (deletions included).
dirs=(
  "$app/app/components/ui:src/components/ui"
  "$app/app/lib/theme:src/lib/theme"
  "$app/storybook:storybook"
  "$app/.storybook:.storybook"
  "$app/public/resources/fonts/inter:public/resources/fonts/inter"
  "$source_dir/tooling/shot:tooling/shot"
)
files=(
  "$app/app/lib/utils.ts:src/lib/utils.ts"
  "$app/app/lib/toast/toast.ts:src/lib/toast/toast.ts"
  "$app/app/hooks/use-mobile.tsx:src/hooks/use-mobile.tsx"
  "$app/app/tailwind.css:src/tailwind.css"
  "$app/app/inter.css:src/inter.css"
  "$app/app/actions/utils/format-shortcut.ts:src/lib/format-shortcut.ts"
  "$source_dir/packages/domain/src/iso-date/iso-date.ts:src/lib/iso-date.ts"
  "$app/DESIGN.md:DESIGN.md"
  "$app/components.json:components.json"
)

for pair in "${dirs[@]}"; do
  from="${pair%%:*}" to="$worktree/${pair#*:}"
  mkdir -p "$to"
  rsync -a --delete --exclude node_modules --exclude '*.log' "$from/" "$to/"
done
for pair in "${files[@]}"; do
  from="${pair%%:*}" to="$worktree/${pair#*:}"
  mkdir -p "$(dirname "$to")"
  cp "$from" "$to"
done

sha="$(git -C "$source_dir" rev-parse --short HEAD)"
dirty=""
[[ -n "$(git -C "$source_dir" status --porcelain -- apps/dashboard tooling packages/domain)" ]] && dirty=" + working tree"
git -C "$worktree" add -A
if git -C "$worktree" diff --cached --quiet; then
  echo "upstream: no changes since the last snapshot"
else
  git -C "$worktree" commit --quiet -m "upstream: elternportal ${sha}${dirty}"
  echo "upstream: committed elternportal ${sha}${dirty}"
fi

if [[ "$snapshot_only" == false ]]; then
  git -C "$repo" merge --no-edit upstream
fi
