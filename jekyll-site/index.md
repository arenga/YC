---
title: "YC 에세이 실행 번역 홈"
layout: default
permalink: /
---

<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow">실행 번역 블로그</p>
    <h1>Paul Graham 에세이를 한국 스타트업 언어로, 바로 실행 가능한 포맷으로.</h1>
    <p class="lead">
      요약 → 실무 번역 → 실행 체크리스트 → 사례/툴킷 → CTA까지 한 흐름으로 읽을 수 있는 롱폼을 만듭니다.
    </p>
    <div class="hero-actions">
      <a class="btn primary" href="#latest">전체 에세이 보기</a>
      <a class="btn ghost" href="{{ '/essays/' | relative_url }}">카테고리 인덱스</a>
    </div>
    <div class="hero-badges">
      <span class="pill small">요약/핵심 문장</span>
      <span class="pill small alt">실무 번역</span>
      <span class="pill small">체크리스트 CTA</span>
    </div>
  </div>
  <div class="hero-card">
    <p class="eyebrow">발행 원칙</p>
    <h3>실행 가이드가 먼저 보이도록</h3>
    <p class="muted">모바일/IG 인앱 브라우저에서 바로 읽히도록 짧은 문단과 CTA 버튼을 배치합니다.</p>
    <ul class="muted">
      <li>모바일 우선 레이아웃</li>
      <li>카테고리·난이도 필터</li>
      <li>UTM/CTA 영역 분리</li>
    </ul>
  </div>
</section>

{% assign categories = site.essays | map: "category" | compact | uniq | sort %}
{% assign difficulties = site.essays | map: "difficulty" | compact | uniq %}

<section id="filters" class="filters">
  <div class="filter-controls">
    <label>
      카테고리
      <select id="categoryFilter">
        <option value="all">전체</option>
        {% for category in categories %}
          {% assign doc = site.essays | where: "category", category | first %}
          <option value="{{ doc.category_slug }}">{{ category }}</option>
        {% endfor %}
      </select>
    </label>
    <label>
      난이도
      <select id="difficultyFilter">
        <option value="all">전체</option>
        {% for level in difficulties %}
          {% assign doc = site.essays | where: "difficulty", level | first %}
          <option value="{{ doc.difficulty_slug }}">{{ level }}</option>
        {% endfor %}
      </select>
    </label>
    <label class="search-field">
      검색
      <input id="searchInput" type="search" placeholder="제목이나 요약으로 검색" />
    </label>
  </div>
  <div class="filter-hint">
    <p class="eyebrow">TIP</p>
    <p class="muted">필터가 적용된 상태에서 CTA 버튼을 누르면 동일한 뷰 상태로 브라우저 공유가 가능합니다.</p>
  </div>
</section>

<section id="latest" class="list-section">
  <div class="section-header">
    <div>
      <p class="eyebrow">전체 에세이</p>
      <h2>카테고리별 실행 번역 모음</h2>
    </div>
    <div class="section-actions">
      <a class="btn ghost" href="{{ '/SUMMARY.md' | relative_url }}">원본 인덱스 보기</a>
      <a class="btn ghost" href="{{ '/PRD.md' | relative_url }}">PRD 확인</a>
    </div>
  </div>
  {% include essay-grid.html id="home-grid" %}
</section>

<script>
  (function () {
    const cards = Array.from(document.querySelectorAll(".essay-card"));
    if (!cards.length) return;

    const categorySelect = document.getElementById("categoryFilter");
    const difficultySelect = document.getElementById("difficultyFilter");
    const searchInput = document.getElementById("searchInput");

    function applyFilters() {
      const category = categorySelect?.value || "all";
      const difficulty = difficultySelect?.value || "all";
      const keyword = (searchInput?.value || "").toLowerCase();

      cards.forEach((card) => {
        const matchCategory = category === "all" || card.dataset.category === category;
        const matchDifficulty = difficulty === "all" || card.dataset.difficulty === difficulty;
        const title = card.querySelector("h3")?.innerText.toLowerCase() || "";
        const summary = card.querySelector("p.muted")?.innerText.toLowerCase() || "";
        const matchKeyword = !keyword || title.includes(keyword) || summary.includes(keyword);
        card.style.display = matchCategory && matchDifficulty && matchKeyword ? "" : "none";
      });
    }

    categorySelect?.addEventListener("change", applyFilters);
    difficultySelect?.addEventListener("change", applyFilters);
    searchInput?.addEventListener("input", applyFilters);
  })();
</script>
