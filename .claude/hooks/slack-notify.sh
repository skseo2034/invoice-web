#!/bin/bash
# Claude Code Slack 알림 훅
# - Notification(permission_prompt): 권한 요청 시 Slack 알림
# - Stop: 작업 완료 시 Slack 알림

# stdin에서 hook input 읽기
HOOK_INPUT=$(cat)

# jq가 없으면 조용히 종료
command -v jq &>/dev/null || exit 0

# jq로 JSON 필드 추출
HOOK_EVENT=$(echo "$HOOK_INPUT" | jq -r '.hook_event_name // ""' 2>/dev/null) || exit 0
[[ -z "$HOOK_EVENT" ]] && exit 0

# [DEBUG] 실제 payload 구조 확인용 임시 로그
echo "[DEBUG $(date)] EVENT=$HOOK_EVENT RAW=$(echo "$HOOK_INPUT" | jq -c '.' 2>/dev/null)" >> /tmp/claude-hook-debug.log

NOTIF_TYPE=$(echo    "$HOOK_INPUT" | jq -r '.notification_type // ""')
STOP_ACTIVE=$(echo   "$HOOK_INPUT" | jq -r 'if .stop_hook_active then "true" else "false" end')
TOOL_NAME=$(echo     "$HOOK_INPUT" | jq -r '
  if (.tool_name // "") != "" then .tool_name
  elif ((.message // "") | test("permission to use \\w+")) then
    (.message // "") | capture("permission to use (?P<t>\\w+)") | .t
  else "Unknown"
  end' 2>/dev/null || echo "Unknown")
MESSAGE=$(echo       "$HOOK_INPUT" | jq -r '(.message // "") | gsub("[\u0001\n\r]"; " ") | .[0:300]')
CWD=$(echo           "$HOOK_INPUT" | jq -r '.cwd // ""')
SESSION_SHORT=$(echo "$HOOK_INPUT" | jq -r '(.session_id // "")[0:8]')

# 프로젝트 이름 (경로 마지막 폴더명)
CWD_NORMALIZED="${CWD//\\//}"
PROJECT_NAME="${CWD_NORMALIZED%/}"
PROJECT_NAME="${PROJECT_NAME##*/}"
[[ -z "$PROJECT_NAME" ]] && PROJECT_NAME="Unknown"

# 현재 시간
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "")

# .env.local에서 SLACK_WEBHOOK_URL 읽기
WEBHOOK_URL=""
ENV_FILE="${CWD_NORMALIZED}/.env.local"
if [[ -f "$ENV_FILE" ]]; then
	WEBHOOK_URL=$(grep -E '^SLACK_WEBHOOK_URL=' "$ENV_FILE" 2>/dev/null | \
		head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs 2>/dev/null || echo "")
fi

# 환경변수 폴백 (시스템 환경변수에도 없으면 조용히 종료)
[[ -z "$WEBHOOK_URL" ]] && WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
[[ -z "$WEBHOOK_URL" ]] && exit 0

# Slack Webhook 전송 (5초 타임아웃, 실패해도 Claude Code 흐름 방해 안 함)
send_slack() {
	curl -s -X POST "$WEBHOOK_URL" \
		-H 'Content-Type: application/json; charset=utf-8' \
		-d @- \
		--max-time 5 \
		-o /dev/null 2>/dev/null || true
}

# jq로 권한 요청 페이로드 생성
build_permission_payload() {
	jq -n \
		--arg project "$PROJECT_NAME" \
		--arg tool    "$TOOL_NAME" \
		--arg msg     "$MESSAGE" \
		--arg ts      "$TIMESTAMP" \
		--arg cwd     "$CWD_NORMALIZED" \
		'{
			text: ("🔐 Claude Code 권한 요청: " + $project + " - " + $tool),
			blocks: [
				{type: "header", text: {type: "plain_text", text: "🔐 Claude Code 권한 요청", emoji: true}},
				{type: "section", fields: [
					{type: "mrkdwn", text: ("*프로젝트*\n`" + $project + "`")},
					{type: "mrkdwn", text: ("*도구*\n`" + $tool + "`")}
				]},
				{type: "section", text: {type: "mrkdwn", text: ("*요청 내용*\n```" + $msg + "```")}},
				{type: "context", elements: [{type: "mrkdwn", text: ("⏰ " + $ts + "  |  📁 `" + $cwd + "`")}]}
			]
		}'
}

# jq로 작업 완료 페이로드 생성
build_stop_payload() {
	jq -n \
		--arg project "$PROJECT_NAME" \
		--arg session "${SESSION_SHORT}..." \
		--arg ts      "$TIMESTAMP" \
		--arg cwd     "$CWD_NORMALIZED" \
		'{
			text: ("✅ Claude Code 작업 완료: " + $project),
			blocks: [
				{type: "header", text: {type: "plain_text", text: "✅ Claude Code 작업 완료", emoji: true}},
				{type: "section", fields: [
					{type: "mrkdwn", text: ("*프로젝트*\n`" + $project + "`")},
					{type: "mrkdwn", text: ("*세션 ID*\n`" + $session + "`")}
				]},
				{type: "context", elements: [{type: "mrkdwn", text: ("⏰ " + $ts + "  |  📁 `" + $cwd + "`")}]}
			]
		}'
}

# 권한 요청 알림
if [[ "$HOOK_EVENT" == "Notification" && "$NOTIF_TYPE" == "permission_prompt" ]]; then
	build_permission_payload | send_slack

# 작업 완료 알림
elif [[ "$HOOK_EVENT" == "Stop" && "$STOP_ACTIVE" != "true" ]]; then
	build_stop_payload | send_slack
fi

exit 0
