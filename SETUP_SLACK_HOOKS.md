# Claude Code Slack 알림 훅 설정 가이드

Claude Code 작업 중 **권한 요청** 및 **작업 완료** 시 Slack으로 자동 알림을 받는 훅 설정 방법입니다.

---

## 알림 종류

| 이벤트 | 트리거 | Slack 메시지 |
|--------|--------|--------------|
| 🔐 권한 요청 | Claude Code가 도구 실행 허가를 요청할 때 | 프로젝트, 도구명, 요청 내용, 경로, 시간 |
| ✅ 작업 완료 | Claude Code가 응답을 완료할 때 | 프로젝트, 세션 ID, 경로, 시간 |

---

## 파일 구조

```
프로젝트 루트/
├── .claude/
│   ├── hooks/
│   │   └── slack-notify.sh       # Slack 알림 스크립트
│   └── settings.local.json       # 훅 이벤트 바인딩 설정
└── .env.local                    # SLACK_WEBHOOK_URL 환경변수
```

> **주의**: `.claude/` 디렉토리는 `.gitignore`에 등록되어 있어 버전 관리에서 제외됩니다.
> 팀원 각자 이 문서를 참고해 직접 설정해야 합니다.

---

## 사전 요구사항

- `bash`, `curl`, `node` 설치
- Slack Incoming Webhook URL

### Slack Webhook URL 발급

1. [Slack API](https://api.slack.com/apps) → **Create New App** → **From scratch**
2. 앱 이름 입력 후 워크스페이스 선택
3. **Incoming Webhooks** 메뉴 → **Activate Incoming Webhooks** 켜기
4. **Add New Webhook to Workspace** → 알림 받을 채널 선택
5. 생성된 Webhook URL 복사 (`https://hooks.slack.com/services/...`)

---

## 설정 단계

### 1단계: 디렉토리 생성

```bash
mkdir -p .claude/hooks
```

### 2단계: Slack 알림 스크립트 생성

`.claude/hooks/slack-notify.sh` 파일 생성:

```bash
#!/bin/bash
# Claude Code Slack 알림 훅
# - Notification(permission_prompt): 권한 요청 시 Slack 알림
# - Stop: 작업 완료 시 Slack 알림

# stdin에서 hook input 읽기
HOOK_INPUT=$(cat)

# Node.js로 JSON 필드를 탭 구분자로 한 번에 추출
FIELDS=$(echo "$HOOK_INPUT" | node -e "
const d = JSON.parse(require('fs').readFileSync(0, 'utf8'));
process.stdout.write([
    d.hook_event_name || '',
    d.notification_type || '',
    String(!!d.stop_hook_active),
    d.tool_name || 'Unknown',
    (d.message || '').replace(/[\t\n\r]/g, ' ').substring(0, 300),
    d.cwd || '',
    (d.session_id || '').substring(0, 8)
].join('\t'));
" 2>/dev/null || echo "")

[[ -z "$FIELDS" ]] && exit 0

# 필드 분리
IFS=$'\t' read -r HOOK_EVENT NOTIF_TYPE STOP_ACTIVE TOOL_NAME MESSAGE CWD SESSION_SHORT <<< "$FIELDS"

# 프로젝트 이름 (경로 마지막 폴더명)
CWD_NORMALIZED="${CWD//\\//}"
PROJECT_NAME="${CWD_NORMALIZED%/}"
PROJECT_NAME="${PROJECT_NAME##*/}"
[[ -z "$PROJECT_NAME" ]] && PROJECT_NAME="Unknown"

# 현재 시간
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "")

# .env.local에서 SLACK_WEBHOOK_URL 읽기
WEBHOOK_URL=""
ENV_FILE="${CWD}/.env.local"
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
		-d "$1" \
		--max-time 5 \
		-o /dev/null 2>/dev/null || true
}

# Node.js로 JSON 생성 (UTF-8 안전 - Windows Git Bash 인코딩 문제 우회)
build_permission_payload() {
	node -e "
		const data = {
			text: '🔐 Claude Code 권한 요청: ' + process.env.PROJECT + ' - ' + process.env.TOOL,
			blocks: [
				{type: 'header', text: {type: 'plain_text', text: '🔐 Claude Code 권한 요청', emoji: true}},
				{type: 'section', fields: [
					{type: 'mrkdwn', text: '*프로젝트*\n\`' + process.env.PROJECT + '\`'},
					{type: 'mrkdwn', text: '*도구*\n\`' + process.env.TOOL + '\`'}
				]},
				{type: 'section', text: {type: 'mrkdwn', text: '*요청 내용*\n\`\`\`' + process.env.MSG + '\`\`\`'}},
				{type: 'context', elements: [{type: 'mrkdwn', text: '⏰ ' + process.env.TS + '  |  📁 \`' + process.env.CWD_PATH + '\`'}]}
			]
		};
		process.stdout.write(JSON.stringify(data));
	" PROJECT="$PROJECT_NAME" TOOL="$TOOL_NAME" MSG="$MESSAGE" TS="$TIMESTAMP" CWD_PATH="$CWD_NORMALIZED"
}

build_stop_payload() {
	node -e "
		const data = {
			text: '✅ Claude Code 작업 완료: ' + process.env.PROJECT,
			blocks: [
				{type: 'header', text: {type: 'plain_text', text: '✅ Claude Code 작업 완료', emoji: true}},
				{type: 'section', fields: [
					{type: 'mrkdwn', text: '*프로젝트*\n\`' + process.env.PROJECT + '\`'},
					{type: 'mrkdwn', text: '*세션 ID*\n\`' + process.env.SESSION + '\`'}
				]},
				{type: 'context', elements: [{type: 'mrkdwn', text: '⏰ ' + process.env.TS + '  |  📁 \`' + process.env.CWD_PATH + '\`'}]}
			]
		};
		process.stdout.write(JSON.stringify(data));
	" PROJECT="$PROJECT_NAME" SESSION="${SESSION_SHORT}..." TS="$TIMESTAMP" CWD_PATH="$CWD_NORMALIZED"
}

# 권한 요청 알림
if [[ "$HOOK_EVENT" == "Notification" && "$NOTIF_TYPE" == "permission_prompt" ]]; then
	PAYLOAD=$(build_permission_payload)
	send_slack "$PAYLOAD"

# 작업 완료 알림
elif [[ "$HOOK_EVENT" == "Stop" && "$STOP_ACTIVE" != "true" ]]; then
	PAYLOAD=$(build_stop_payload)
	send_slack "$PAYLOAD"
fi

exit 0
```

스크립트에 실행 권한 부여:

```bash
chmod +x .claude/hooks/slack-notify.sh
```

### 3단계: 훅 이벤트 바인딩 설정

`.claude/settings.local.json` 파일 생성:

```json
{
	"permissions": {
		"allow": [
			"Bash(npm run:*)",
			"mcp__playwright__*",
			"Bash(curl:*)",
			"Bash(npx:*)",
			"Bash(ls:*)",
			"Bash(cat:*)",
			"Bash(node:*)",
			"Bash(git add:*)",
			"Bash(git commit:*)"
		]
	},
	"hooks": {
		"Notification": [
			{
				"matcher": "",
				"hooks": [
					{
						"type": "command",
						"command": "bash .claude/hooks/slack-notify.sh",
						"timeout": 15
					}
				]
			}
		],
		"Stop": [
			{
				"matcher": "",
				"hooks": [
					{
						"type": "command",
						"command": "bash .claude/hooks/slack-notify.sh",
						"timeout": 15
					}
				]
			}
		]
	}
}
```

### 4단계: Webhook URL 환경변수 설정

`.env.local` 파일에 추가:

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## 작동 방식

```
Claude Code 이벤트 발생
        │
        ├── Notification (permission_prompt)
        │       └── slack-notify.sh 실행
        │               └── 🔐 권한 요청 메시지 전송
        │
        └── Stop (작업 완료)
                └── slack-notify.sh 실행
                        └── ✅ 작업 완료 메시지 전송
```

- **Webhook URL 우선순위**: `.env.local` → 시스템 환경변수 → 설정 없으면 조용히 종료
- **5초 타임아웃**: Slack 전송이 실패해도 Claude Code 흐름에 영향 없음
- **`stop_hook_active` 필터**: 훅 자체가 트리거한 Stop 이벤트는 무시 (무한루프 방지)

---

## 테스트

1. `.env.local`에 `SLACK_WEBHOOK_URL` 설정 확인
2. Claude Code에서 권한이 필요한 작업 요청 → 🔐 알림 확인
3. Claude Code 응답 완료 후 → ✅ 알림 확인

스크립트 직접 테스트:

```bash
echo '{"hook_event_name":"Stop","stop_hook_active":false,"cwd":"/your/project","session_id":"abc12345"}' \
  | bash .claude/hooks/slack-notify.sh
```
