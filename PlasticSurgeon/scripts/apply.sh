#!/usr/bin/env bash
# Linden (Plastic Surgeon v3) apply runner for the Framer box.
# Every write step is a dry run unless --apply is passed. Logs go to PlasticSurgeon/logs/v3_<step>.txt.
#
#   scripts/apply.sh setup                     npx @framer/agent@latest setup (once per box)
#   scripts/apply.sh session                   session new gRmO0VwmSky5joyYsfug, saved to /tmp/linden/session
#   scripts/apply.sh sync-ref                  copy DIRECTION.md over ref/DIRECTION.md if the box has one
#   scripts/apply.sh check                     local package lint (copy rules, bans, palette)
#   scripts/apply.sh step <name> [--apply]     run scripts/exec/<name>.js with the prelude
#   scripts/apply.sh dsl <name> [--apply]      render scripts/dsl/<name>.dsl; apply-changes on / with --apply
#   scripts/apply.sh home [--apply]            Home-first sequence, pausing for review after each step
#   scripts/apply.sh verify                    60_verify_home (read-only), records the result in ids.json
#   scripts/apply.sh critique-done             records logs/v3_ic_critique.md facet scores (Precise, Private ≥ 4)
#   scripts/apply.sh publish-preview           95_publish_preview after typing PREVIEW
set -euo pipefail

PKG="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ID="gRmO0VwmSky5joyYsfug"
# FRAMER_AGENT overrides the CLI (tests point it at tests/fake-agent.mjs).
read -r -a FA <<< "${FRAMER_AGENT:-npx --yes @framer/agent@latest}"
STATE_DIR="${LINDEN_STATE_DIR:-/tmp/linden}"
SESSION_FILE="$STATE_DIR/session"
LOG_DIR="${LINDEN_LOG_DIR:-$PKG/logs}"
mkdir -p "$STATE_DIR" "$LOG_DIR"

die() { echo "apply.sh: $*" >&2; exit 1; }

session_id() {
    [[ -s "$SESSION_FILE" ]] || die "no session; run: scripts/apply.sh session"
    cat "$SESSION_FILE"
}

has_flag() {
    local flag="$1"; shift
    for a in "$@"; do [[ "$a" == "$flag" ]] && return 0; done
    return 1
}

run_step() {
    local name="$1"; shift
    local file="$PKG/scripts/exec/$name.js"
    [[ -f "$file" ]] || die "no such step: $name (see scripts/exec/)"
    local sid; sid="$(session_id)"
    local prelude_args=()
    has_flag --apply "$@" && prelude_args+=(--apply)
    for a in "$@"; do [[ "$a" == --flag=* ]] && prelude_args+=("$a"); done
    local log="$LOG_DIR/v3_${name}.txt"
    echo "── $name ${prelude_args[*]:-(dry run)} → $log"
    { node "$PKG/scripts/prelude.mjs" "${prelude_args[@]}"; cat "$file"; } \
        | "${FA[@]}" exec -s "$sid" 2>&1 \
        | node "$PKG/scripts/merge-ids.mjs" \
        | tee "$log"
}

run_dsl() {
    local name="${1%.dsl}"; shift
    local out="$STATE_DIR/dsl"
    node "$PKG/scripts/render-dsl.mjs" "$name" --out "$out"
    local rendered="$out/$name.dsl"
    local log="$LOG_DIR/v3_dsl_${name}.txt"
    if ! has_flag --apply "$@"; then
        echo "── $name (dry run) rendered to $rendered"
        cat "$rendered"
        return
    fi
    local sid; sid="$(session_id)"
    echo "── $name → apply-changes on / → $log"
    "${FA[@]}" apply-changes -s "$sid" -p / -e "$(cat "$rendered")" 2>&1 | tee "$log"
}

pause() {
    [[ "${LINDEN_NO_PAUSE:-}" == "1" ]] && return
    read -r -p "Review the output above. Continue? [y/N] " ok
    [[ "$ok" == "y" || "$ok" == "Y" ]] || die "stopped by operator"
}

cmd="${1:-help}"; shift || true
case "$cmd" in
    setup)
        "${FA[@]}" setup
        ;;
    session)
        out="$("${FA[@]}" session new "$PROJECT_ID")"
        echo "$out"
        sid="$(echo "$out" | grep -oE '[A-Za-z0-9_-]{4,}' | tail -n 1)"
        [[ -n "$sid" ]] || die "could not read a session id from the output above; write it to $SESSION_FILE"
        echo "$sid" > "$SESSION_FILE"
        echo "Session $sid saved. Now read the generated projects/$PROJECT_ID/index.md task map."
        ;;
    sync-ref)
        if [[ -d "$PKG/ref" && -f "$PKG/ref/DIRECTION.md" ]]; then
            cp "$PKG/DIRECTION.md" "$PKG/ref/DIRECTION.md"
            echo "ref/DIRECTION.md now matches DIRECTION.md (v3 The Sitting / Linden)."
        else
            echo "No ref/DIRECTION.md on this box; DIRECTION.md is the only copy."
        fi
        ;;
    check)
        node "$PKG/scripts/check-package.mjs"
        ;;
    step)
        [[ $# -ge 1 ]] || die "usage: step <name> [--apply]"
        run_step "$@"
        ;;
    dsl)
        [[ $# -ge 1 ]] || die "usage: dsl <name> [--apply]"
        run_dsl "$@"
        ;;
    home)
        node "$PKG/scripts/check-package.mjs"
        run_step 00_inventory; pause
        for s in 10_color_tokens 11_text_presets 20_contact_sheet 30_images 40_cms; do
            run_step "$s"; pause
            has_flag --apply "$@" && { run_step "$s" --apply; pause; }
        done
        echo "Fill ids.json → components.* (button, header, footer) and imagePicks from project-inventory.md, then continue."
        pause
        for d in 21_buttons 22_header 23_footer; do run_dsl "$d" "$@"; pause; done
        has_flag --apply "$@" && { run_step 50_home_hide_legacy --apply; pause; }
        for d in 31_home_hero 32_home_contact_sheet 33_home_procedures 34_home_surgeon 35_home_pricing \
                 36_home_notes 37_home_faq 38_home_consult 39_home_consult_strip; do
            run_dsl "$d" "$@"; pause
        done
        run_step 60_verify_home
        echo "Next: screenshots to shots/v3/, logs/v3_ic_critique.md, scripts/apply.sh critique-done, then publish-preview."
        ;;
    verify)
        run_step 60_verify_home
        ;;
    critique-done)
        f="$LOG_DIR/v3_ic_critique.md"
        [[ -f "$f" ]] || die "write $f first (four lenses + facet scores)"
        precise="$(grep -oiE 'Precise[^0-9]{0,20}([1-5])' "$f" | grep -oE '[1-5]$' | head -n 1 || true)"
        private="$(grep -oiE 'Private[^0-9]{0,20}([1-5])' "$f" | grep -oE '[1-5]$' | head -n 1 || true)"
        [[ -n "$precise" && -n "$private" ]] || die "could not read Precise and Private scores in $f"
        (( precise >= 4 && private >= 4 )) || die "Precise $precise / Private $private: both must be ≥ 4 before preview"
        echo "IDS_PATCH {\"critique\":{\"precise\":$precise,\"private\":$private,\"at\":\"$(date -u +%FT%TZ)\"}}" \
            | node "$PKG/scripts/merge-ids.mjs" >/dev/null
        echo "Critique recorded: Precise $precise, Private $private."
        ;;
    publish-preview)
        read -r -p "Type PREVIEW to publish a preview for Jamshid (never Marketplace): " ok
        [[ "$ok" == "PREVIEW" ]] || die "not confirmed"
        run_step 95_publish_preview --apply --flag=previewConfirmed
        ;;
    help|*)
        sed -n '2,16p' "${BASH_SOURCE[0]}"
        ;;
esac
