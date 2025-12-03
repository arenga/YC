# 아고라 Jekyll 블로그

Paul Graham 에세이 한국어 번역본을 제공하는 Jekyll 기반 블로그입니다.

## 프로젝트 구조

```
blog/
├── _config.yml          # Jekyll 설정 파일
├── _layouts/            # 레이아웃 템플릿
│   ├── default.html     # 기본 레이아웃
│   └── essay.html       # 에세이 페이지 레이아웃
├── _essays/             # 에세이 컬렉션 (229개)
├── assets/
│   └── css/
│       └── main.css     # 스타일시트
├── index.html           # 홈페이지
├── Gemfile              # Ruby 의존성
└── README.md            # 이 파일

## 시작하기

### 방법 1: Docker 사용 (권장)

가장 간단한 방법입니다. Ruby 설치나 권한 문제를 걱정할 필요 없습니다.

```bash
cd blog
docker-compose up
```

브라우저에서 [http://localhost:4000](http://localhost:4000) 접속

### 방법 2: 로컬 Ruby 사용

#### 1. Ruby 및 Bundler 설치

macOS에는 기본적으로 Ruby가 설치되어 있습니다. 하지만 시스템 Ruby는 권한 문제가 있을 수 있으므로 rbenv나 rvm 사용을 권장합니다.

**rbenv 설치 (권장):**

```bash
brew install rbenv ruby-build
rbenv install 3.1.0
rbenv global 3.1.0
gem install bundler
```

**또는 시스템 Ruby 사용:**

```bash
# 로컬 경로에 번들 설치 설정
cd blog
bundle config set --local path 'vendor/bundle'
```

#### 2. Jekyll 의존성 설치

```bash
cd blog
bundle install
```

#### 3. 로컬 서버 실행

```bash
bundle exec jekyll serve
```

또는 프로젝트 루트에서:

```bash
npm run jekyll:serve
```

브라우저에서 [http://localhost:4000](http://localhost:4000) 접속

### 4. 빌드

정적 사이트를 빌드하려면:

```bash
bundle exec jekyll build
```

또는:

```bash
npm run jekyll:build
```

빌드된 파일은 `_site/` 디렉토리에 생성됩니다.

## 주요 기능

### 1. 에세이 컬렉션
- 총 229개의 Paul Graham 에세이
- 카테고리: Mindset, Product, Go-to-Market, Fundraising, Operations & Execution, Productivity & Efficiency
- 난이도: 초급, 중급, 고급

### 2. 필터링 기능
- 카테고리별 필터링
- 난이도별 필터링
- 실시간 JavaScript 필터링

### 3. 에세이 페이지 구성
- 요약 (Summary): 한국어 뉴스레터 형식
- 한국어 번역 (Korean Translation): 전체 번역
- 원문 (Original Essay): 영문 원문

### 4. 디자인
- moistmarketer.com 스타일 참고
- 미니멀하고 깔끔한 디자인
- 모바일 반응형

## 에세이 추가/업데이트

기존 에세이를 수정하거나 새로운 에세이를 추가하려면:

1. `essays/` 디렉토리의 원본 마크다운 파일 수정
2. 변환 스크립트 실행:
   ```bash
   npm run 21:jekyll-convert
   ```

## 배포

### GitHub Pages
1. GitHub 리포지토리 생성
2. `blog/` 디렉토리를 GitHub에 푸시
3. Settings > Pages에서 GitHub Pages 활성화

### Netlify
1. Netlify에 연결
2. Build command: `bundle exec jekyll build`
3. Publish directory: `_site`

### Vercel
1. Vercel에 연결
2. Framework Preset: Jekyll
3. Build Command: `bundle exec jekyll build`
4. Output Directory: `_site`

## 커스터마이징

### 색상 및 스타일
`assets/css/main.css`의 CSS 변수를 수정:

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #2563eb;
  /* ... */
}
```

### 카테고리 및 난이도 이름
`_config.yml`에서 한국어 이름을 수정:

```yaml
category_names:
  Mindset: "마인드셋"
  Product: "프로덕트"
  # ...

difficulty_levels:
  초급: "입문"
  중급: "중급"
  고급: "고급"
```

## 라이선스

Paul Graham 에세이는 원저작자의 저작권을 따릅니다.
번역 및 요약은 교육 목적으로 제공됩니다.

## 크레딧

- 원문: [Paul Graham](https://paulgraham.com/)
- 디자인 영감: [촉촉한 마케터](https://style.moistmarketer.com/)
