# Getting Started - Paul Graham Essay Analysis

한국 PM/PO/창업자를 위한 Paul Graham 에세이 분석 프로젝트입니다.

## 🚀 빠른 시작

### 1단계: 환경 설정

1. `.env` 파일을 생성하고 Anthropic API 키를 추가하세요:

```bash
cp .env.example .env
# .env 파일을 열어서 ANTHROPIC_API_KEY를 입력하세요
```

### 2단계: 스크립트 실행

프로젝트는 5개의 순차적 스크립트로 구성되어 있습니다:

```bash
# 1. 에세이 링크 추출 (paulgraham.com/articles.html)
npm run 1:extract

# 2. 에세이 콘텐츠 스크래핑 (200+ 에세이, ~10-15분 소요)
npm run 2:scrape

# 3. 데이터 검증
npm run 3:validate

# 4. AI 분석 (Claude API 사용, 예상 비용 $20-30)
npm run 4:analyze

# 5. 파일 구조화 및 마크다운 생성
npm run 5:organize
```

또는 한 번에 모두 실행:

```bash
npm run all
```

## 📁 결과물 구조

```
YC/
├── README.md              # 마스터 인덱스
├── SUMMARY.md             # 전체 에세이 테이블
├── essays/
│   ├── Mindset/
│   │   ├── 초급/
│   │   ├── 중급/
│   │   ├── 고급/
│   │   └── README.md
│   ├── Product/
│   ├── Go-to-Market/
│   ├── Fundraising/
│   ├── Operations & Execution/
│   └── Productivity & Efficiency/
└── data/
    ├── essay-links.json
    ├── essays-raw.json
    ├── essays-analyzed.json
    └── validation-report.json
```

## 🔧 문제 해결

### npm 캐시 권한 오류

```bash
npm install --cache /tmp/npm-cache [package-name]
```

### Playwright 브라우저 설치

```bash
npx playwright install chromium
```

### API 키 오류

`.env` 파일에 올바른 `ANTHROPIC_API_KEY`가 설정되었는지 확인하세요.

## 📊 카테고리 (MECE)

1. **Mindset**: 창업자/PM/PO의 태도와 사고체계
2. **Product**: 사용자를 위한 가치제공
3. **Go-to-Market**: 고객 획득 및 확장 전략
4. **Fundraising**: 외부 자본 유치/투자
5. **Operations & Execution**: 제품이 시장에서 작동하도록 만드는 메커니즘
6. **Productivity & Efficiency**: 개인/조직이 일하는 방식/습관/시스템

## 🎯 난이도

- **초급**: 기본적인 스타트업 개념, PM/PO 입문자도 이해 가능
- **중급**: 1-3년 PM/스타트업 경험자 대상, 실행 중심
- **고급**: 실리콘밸리 맥락, 깊은 전략적 사고, 3년 이상 경험 필요

## ⚙️ 기술 스택

- **TypeScript**: 타입 안정성
- **Playwright**: 웹 스크래핑
- **Cheerio**: HTML 파싱
- **Anthropic Claude API**: AI 분석 및 번역
- **tsx**: TypeScript 실행

## 📝 각 에세이 포함 내용

- 한국어 요약
- 핵심 포인트 (3-5개)
- 한국 PM/PO 적용 시사점
- 원문 전체 (영어)

## 💰 예상 비용

- 에세이 스크래핑: 무료
- Claude API 분석 (~200 에세이): $20-30 USD

## ⏱️ 예상 소요 시간

- 링크 추출: <1분
- 콘텐츠 스크래핑: 10-15분 (rate limiting)
- 데이터 검증: <1분
- AI 분석: 3-5분 (API 처리 속도에 따라)
- 파일 구조화: <1분

**총 소요 시간**: 약 15-20분

## 🔗 유용한 링크

- [Paul Graham's Essays](https://paulgraham.com/articles.html)
- [Anthropic Claude API Docs](https://docs.anthropic.com/)
- [Playwright Documentation](https://playwright.dev/)
