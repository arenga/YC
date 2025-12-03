---
layout: essay
title: "Why Arc Isn't Especially Object-Oriented"
category: Mindset
difficulty: 중급
year: 
url_original: "https://paulgraham.com/noop.html"
---

## 요약 (Summary)

🎯 왜 Arc는 객체지향이 아닐까요?

✨ 핵심 내용 요약

Paul Graham이 만든 언어 Arc는 객체지향(OOP)을 중심에 두지 않습니다. 왜일까요? **OOP가 과대평가되었기 때문입니다**.

1990-2000년대, 모두가 "OOP가 미래다"라고 했습니다. 학교에서도 Java로 OOP를 가르쳤죠. 하지만 Graham은 의문을 가졌습니다: "정말 모든 것을 객체로 만들어야 하나?" 그의 답: 아니요. 많은 문제는 간단한 함수로 충분합니다. OOP는 복잡한 문제에만 필요합니다. 2025년: Graham이 옳았습니다. Python, JavaScript - 멀티패러다임입니다. OOP만 고집하지 않습니다. 교훈: **유행을 맹신하지 마세요**. 문제에 맞는 도구를 쓰세요.

**핵심 포인트**
• OOP는 과대평가되었습니다
• 모든 문제에 OOP가 필요하지 않습니다
• 문제에 맞는 도구를 선택하세요

🚀 오늘 바로 실천해볼 한 가지
"모두가 이렇게 한다"는 이유로 기술을 선택하지 마세요. "이게 우리 문제에 맞나?"를 물어보세요.

---

## 한국어 번역 (Korean Translation)

현재 객체지향 프로그래밍에 대한 일종의 열광이 있지만, 내가 아는 가장 똑똑한 프로그래머 중 일부는 그것에 대해 가장 덜 흥미를 느끼는 사람도 있습니다. 내 생각에는 객체지향 프로그래밍이 어떤 경우에는 유용한 기술이지만 작성하는 모든 프로그램에 퍼져 있어야 하는 것은 아닙니다.새로운 유형을 정의할 수 있어야 하지만 모든 프로그램을 새로운 유형의 정의로 표현할 필요는 없습니다. 사람들이 객체 지향 프로그래밍을 좋아하는 5가지 이유가 있고 그 중 3개 반은 나쁘다고 생각합니다. 객체 지향 프로그래밍은 어휘 클로저나 매크로 없이 정적으로 유형이 지정된 언어를 사용하는 경우 흥미진진합니다.어느 정도는 이러한 제한을 피할 수 있는 방법을 제공합니다.(Greenspun의 10번째 규칙을 참조하십시오.) 객체 지향 프로그래밍은 대기업에서 인기가 있습니다. 왜냐하면 그것이 소프트웨어 작성 방식에 적합하기 때문입니다.대기업에서는 평범한 프로그래머로 구성된 대규모(자주 변경되는) 팀이 소프트웨어를 작성하는 경향이 있습니다.객체 지향 프로그래밍은 이들 프로그래머 중 어느 누구도 너무 많은 피해를 입히는 것을 방지하는 규율을 부과합니다.그 대가는 결과 코드가 프로토콜로 인해 부풀어 오르고 중복으로 가득 차 있다는 것입니다.대기업의 경우 이는 그리 높은 가격이 아닙니다. 어쨌든 그들의 소프트웨어는 아마도 부풀어오르고 중복으로 가득 차 있을 것이기 때문입니다.객체 지향 프로그래밍은 작업처럼 보이는 많은 것을 생성합니다.팬폴드 시절에는 한 페이지에 5~10줄의 코드만 넣고 그 앞에 20줄의 정교한 형식의 주석을 넣는 유형의 프로그래머가 있었습니다.객체 지향 프로그래밍은 이러한 사람들에게 크랙과 같습니다. 이를 통해 이 모든 스캐폴딩을 소스 코드에 바로 통합할 수 있습니다.Lisp 해커가 기호를 목록에 푸시하여 처리할 수 있는 것은 클래스와 메서드의 전체 파일이 됩니다.따라서 자신이 많은 일을 하고 있다는 사실을 자신이나 다른 사람에게 확신시키려는 경우 이는 좋은 도구입니다.언어 자체가 객체 지향 프로그램이라면 사용자가 확장할 수 있습니다.글쎄요.아니면 객체 지향 프로그래밍의 하위 개념을 개별적으로 제공하여 더 나은 결과를 얻을 수도 있습니다.예를 들어 오버로딩은 본질적으로 클래스에 연결되어 있지 않습니다.두고 보자.객체 지향 추상화는 시뮬레이션 및 CAD 시스템과 같은 특정 종류의 프로그램 영역에 깔끔하게 매핑됩니다.저는 개인적으로 객체 지향 추상화가 필요하지 않았습니다.Common Lisp는 엄청나게 강력한 객체 시스템을 가지고 있는데 나는 그것을 한 번도 사용해 본 적이 없습니다.나는 더 멍청한 언어에서 수행하려면 객체 지향 기술이 필요한 많은 일(예: 클로저로 가득 찬 해시 테이블 만들기)을 수행했지만 CLOS를 사용할 필요는 없었습니다. 어쩌면 내가 멍청하거나 일부 제한된 응용 프로그램 하위 집합에서 작업했을 수도 있습니다.자신의 프로그래밍 경험을 바탕으로 언어를 설계하는 것은 위험합니다.하지만 좋은 생각이라고 생각해서 필요하지 않은 물건을 넣는 것이 더 위험해 보입니다.Rees Re: OO스페인어 번역

---

## 원문 (Original Essay)

There is a kind of mania for object-oriented programming at the moment, but some of the smartest programmers I know are some of the least excited about it.My own feeling is that object-oriented programming is a useful technique in some cases, but it isn't something that has to pervade every program you write. You should be able to define new types, but you shouldn't have to express every program as the definition of new types.I think there are five reasons people like object-oriented programming, and three and a half of them are bad: Object-oriented programming is exciting if you have a statically-typed language without lexical closures or macros. To some degree, it offers a way around these limitations. (See Greenspun's Tenth Rule.) Object-oriented programming is popular in big companies, because it suits the way they write software. At big companies, software tends to be written by large (and frequently changing) teams of mediocre programmers. Object-oriented programming imposes a discipline on these programmers that prevents any one of them from doing too much damage. The price is that the resulting code is bloated with protocols and full of duplication. This is not too high a price for big companies, because their software is probably going to be bloated and full of duplication anyway. Object-oriented programming generates a lot of what looks like work. Back in the days of fanfold, there was a type of programmer who would only put five or ten lines of code on a page, preceded by twenty lines of elaborately formatted comments. Object-oriented programming is like crack for these people: it lets you incorporate all this scaffolding right into your source code. Something that a Lisp hacker might handle by pushing a symbol onto a list becomes a whole file of classes and methods. So it is a good tool if you want to convince yourself, or someone else, that you are doing a lot of work. If a language is itself an object-oriented program, it can be extended by users. Well, maybe. Or maybe you can do even better by offering the sub-concepts of object-oriented programming a la carte. Overloading, for example, is not intrinsically tied to classes. We'll see. Object-oriented abstractions map neatly onto the domains of certain specific kinds of programs, like simulations and CAD systems. I personally have never needed object-oriented abstractions. Common Lisp has an enormously powerful object system and I've never used it once. I've done a lot of things (e.g. making hash tables full of closures) that would have required object-oriented techniques to do in wimpier languages, but I have never had to use CLOS.Maybe I'm just stupid, or have worked on some limited subset of applications. There is a danger in designing a language based on one's own experience of programming. But it seems more dangerous to put stuff in that you've never needed because it's thought to be a good idea.Rees Re: OOSpanish Translation

---

_분석일: 2025. 11. 29._
_수집일: 2025. 11. 28._