# YC 철학 기반 AI Agent 구현 가이드 (MVP)

## 1) 철학 요약
- `philosophy/core.md`: Paul Graham 에세이(= `blog/_essays`)에서 반복되는 원칙 16개를 요약.
- `philosophy/prompts.md`: 에이전트 시스템 프롬프트 초안, 톤/금지/포맷 정의.

## 2) 임베딩 생성
사전 준비:
- 환경변수: `OPENAI_API_KEY`
- 의존성: `npm install`

실행:
```bash
cd blog
cd .. # repo 루트
npm run build:embeddings
```
동작:
- `scripts/11-build-embeddings.ts`가 `blog/_essays` 마크다운을 읽어 문자 단위로 chunk(기본 800자, 150자 overlap).
- `data/embeddings.jsonl`에 JSONL로 저장: `{id, title, category, difficulty, chunk, essayPath, position, embedding}`.

## 3) RAG + LLM API (예시 설계)
- 엔드포인트: `POST /api/chat`
- 입력: `{ messages: [{role, content}] }`
- 처리:
  1. 마지막 사용자 질문으로 임베딩 검색(코사인 유사도) → 상위 3~5개 chunk를 컨텍스트로 선택.
  2. 시스템 프롬프트(`philosophy/prompts.md`) + 컨텍스트 + 대화 이력으로 LLM 호출.
  3. 실행 항목 2~3개, 근거(철학/에세이명) 포함한 응답 반환.
- 출력: `{ reply }`
- 구현: `api/chat.ts` (Vercel 함수 스타일). 모델 `gpt-4o-mini`, 검색 `text-embedding-3-small`.
- 포맷 가드: 요약/실행/근거/리스크 섹션 강제, 과도한 낙관/모호함 금지, 법/세무/의료 확정 자문 차단.

## 4) 프론트엔드
- `blog/chat/index.html`: 간단한 챗 UI (입력/로그). 백엔드 `/api/chat`가 필요.
- 사용자 컨텍스트 폼 포함(업종/스테이지/핵심 지표/주간 목표). 로컬스토리지 저장 후 질문과 함께 전달.

## 5) 품질/가드레일
- 금지: 법률/세무/의료 확정 자문, 근거 없는 숫자/시장 추정.
- 불확실: 질문으로 명료화, 가정은 “가정”으로 명시.
- 톤: 직설/실용/간결, 실행 항목 중심(3개 이내).

## 6) 앞으로의 TODO
- `/api/chat` 구현 (예: Vercel/Netlify 함수): 검색 + LLM 호출.
- 임베딩 검색 유틸리티 추가 (코사인 유사도)와 캐싱.
- 데이터 증분 업데이트: 새 에세이 추가 시 임베딩 재생성 워크플로우.
