---
layout: essay
title: "The Roots of Lisp"
category: Mindset
difficulty: 중급
year: 
url_original: "https://paulgraham.com/rootsoflisp.html"
---

## 요약 (Summary)

🎯 Lisp의 뿌리는 무엇일까요?

✨ 핵심 내용 요약

Paul Graham이 Lisp의 수학적 기초를 설명합니다. 놀라운 점: **7개의 연산자로 모든 것을 만들 수 있습니다**.

Lisp은 1960년 John McCarthy가 수학 논문으로 시작했습니다. 7개의 기본 함수(quote, atom, eq, car, cdr, cons, cond)로 프로그래밍 언어 전체를 만들 수 있다는 증명이었죠. 이게 얼마나 강력할까요? 다른 언어는 수백 개의 키워드가 필요합니다. 하지만 Lisp은 7개면 충분합니다. 나머지는 이 7개로 만들 수 있습니다. 비즈니스 교훈: **단순한 원칙이 강력합니다**. Amazon의 "customer obsession", Apple의 "simplicity" - 하나의 원칙으로 모든 결정을 합니다.

**핵심 포인트**
• 7개의 연산자로 모든 것을 만들 수 있습니다
• 단순한 원칙이 강력합니다
• 복잡성이 아니라 본질에 집중하세요

🚀 오늘 바로 실천해볼 한 가지
당신의 회사/제품의 "핵심 원칙" 3가지를 정의하세요. 모든 결정을 이것으로 하세요.

---

## 한국어 번역 (Korean Translation)

2001년 5월 (나는 McCarthy가 발견한 것을 정확히 이해하기 위해 이 기사를 썼습니다. Lisp에서 프로그래밍하기 위해 이 내용을 알 필요는 없지만 Lisp의 본질을 이해하려는 모든 사람에게 도움이 될 것입니다 - 기원과 의미론적 핵심 모두에서 Lisp의 핵심이 있다는 사실은 Lisp의 특징 중 하나이며 다른 언어와 달리 Lisp에 방언이 있는 이유입니다.) 1960년 John McCarthy는유클리드가 기하학에 대해 했던 것과 같은 프로그래밍을 위해 그가 작성한 놀라운 논문입니다.그는 몇 가지 간단한 연산자와 함수 표기법을 사용하여 전체 프로그래밍 언어를 구축할 수 있는 방법을 보여주었습니다.그는 이 언어를 "목록 처리"를 뜻하는 Lisp라고 불렀습니다. 왜냐하면 그의 핵심 아이디어 중 하나가 코드와 데이터 모두에 대한 목록이라는 간단한 데이터 구조를 사용하는 것이었기 때문입니다. McCarthy가 발견한 것은 컴퓨터 역사의 랜드마크일 뿐만 아니라 우리 시대에 프로그래밍이 어떤 경향이 있는지에 대한 모델로서 이해하는 것이 가치가 있습니다.내가 보기에는 지금까지 정말 깔끔하고 일관된 프로그래밍 모델이 두 개 있었는데, 바로 C 모델과 Lisp 모델이었습니다.이 두 지점은 사이에 늪지대 저지대가 있는 고지대처럼 보입니다.컴퓨터가 더욱 강력해짐에 따라 개발되는 새로운 언어는 꾸준히 Lisp 모델을 향해 나아가고 있습니다.지난 20년 동안 새로운 프로그래밍 언어에 대한 인기 있는 방법은 C 모델의 컴퓨팅에 런타임 타이핑 및 가비지 수집과 같은 Lisp 모델에서 가져온 부분을 단편적으로 추가하는 것이었습니다. 이 기사에서 나는 McCarthy가 발견한 것을 가능한 가장 간단한 용어로 설명하려고 합니다.요점은 누군가가 40년 전에 알아낸 흥미로운 이론적 결과에 대해 배우는 것뿐만 아니라 언어가 어디로 향하고 있는지 보여주는 것입니다.Lisp의 특이한 점(사실 Lisp의 품질을 정의하는 특징)은 Lisp 자체로 작성할 수 있다는 것입니다.McCarthy가 이 말의 의미를 이해하기 위해 그의 수학적 표기법을 Common Lisp 코드 실행으로 변환하여 그의 행적을 되짚어 보겠습니다. 전체 기사(후기)What Made Lisp Different코드중국어 번역일본어 번역포르투갈어 번역한국어 번역

---

## 원문 (Original Essay)

May 2001 (I wrote this article to help myself understand exactly what McCarthy discovered. You don't need to know this stuff to program in Lisp, but it should be helpful to anyone who wants to understand the essence of Lisp — both in the sense of its origins and its semantic core. The fact that it has such a core is one of Lisp's distinguishing features, and the reason why, unlike other languages, Lisp has dialects.)In 1960, John McCarthy published a remarkable paper in which he did for programming something like what Euclid did for geometry. He showed how, given a handful of simple operators and a notation for functions, you can build a whole programming language. He called this language Lisp, for "List Processing," because one of his key ideas was to use a simple data structure called a list for both code and data.It's worth understanding what McCarthy discovered, not just as a landmark in the history of computers, but as a model for what programming is tending to become in our own time. It seems to me that there have been two really clean, consistent models of programming so far: the C model and the Lisp model. These two seem points of high ground, with swampy lowlands between them. As computers have grown more powerful, the new languages being developed have been moving steadily toward the Lisp model. A popular recipe for new programming languages in the past 20 years has been to take the C model of computing and add to it, piecemeal, parts taken from the Lisp model, like runtime typing and garbage collection.In this article I'm going to try to explain in the simplest possible terms what McCarthy discovered. The point is not just to learn about an interesting theoretical result someone figured out forty years ago, but to show where languages are heading. The unusual thing about Lisp — in fact, the defining quality of Lisp — is that it can be written in itself. To understand what McCarthy meant by this, we're going to retrace his steps, with his mathematical notation translated into running Common Lisp code.Complete Article (Postscript)What Made Lisp DifferentThe CodeChinese TranslationJapanese TranslationPortuguese TranslationKorean Translation

---

_분석일: 2025. 11. 29._
_수집일: 2025. 11. 28._