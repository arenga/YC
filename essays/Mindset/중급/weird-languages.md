# Weird Languages
**카테고리**: Mindset
**난이도**: 중급
**출판일**: N/A
**원문**: https://paulgraham.com/weird.html
---
## 요약 (Summary)

🎯 이상한 프로그래밍 언어가 왜 중요할까요?

✨ 핵심 내용 요약

Paul Graham은 Lisp이라는 "이상한" 프로그래밍 언어로 Viaweb(후에 Yahoo!에 매각)을 만들었습니다. 당시 대부분의 경쟁사는 C++나 Perl을 사용했죠. Lisp을 선택한 것은 경쟁 우위였습니다. 더 빠르게 개발하고, 더 쉽게 수정하고, 경쟁사가 모방하기 어려웠습니다.

이것이 주는 교훈: 남들과 다른 도구를 사용하는 것은 경쟁 우위가 될 수 있습니다. 모두가 같은 도구를 쓰면 같은 결과만 나옵니다. 이상하고 새로운 도구를 배우는 것을 두려워하지 마세요. 그것이 당신만의 무기가 될 수 있습니다. 중요한 것은 "유행하는 것"이 아니라 "효과적인 것"입니다.

**핵심 포인트**
• 남들과 다른 도구를 사용하면 경쟁 우위가 됩니다
• "이상한" 도구가 종종 더 강력합니다
• 유행보다 효과성을 선택하세요

🚀 오늘 바로 실천해볼 한 가지
당신의 분야에서 "비주류"지만 강력하다고 알려진 도구 하나를 배워보세요.

---

## 한국어 번역 (Korean Translation)

2021년 8월사람들이 자신의 경험상 모든 프로그래밍 언어가 기본적으로 동일하다고 말할 때, 그들은 언어에 관한 것이 아니라 자신이 수행한 프로그래밍의 종류에 대해 진술하는 것입니다. 프로그래밍의 99.5%는 라이브러리 함수에 대한 호출을 함께 연결하는 것으로 구성됩니다.모든 대중적인 언어는 이것에 똑같이 능숙합니다.따라서 인기 있는 프로그래밍 언어의 교차점에서 작업하면서 전체 경력을 쉽게 보낼 수 있습니다. 그러나 프로그래밍의 나머지 0.5%는 불균형적으로 흥미롭습니다.그것이 무엇으로 구성되어 있는지 알고 싶다면 이상한 언어의 이상한 점을 따라가는 것이 좋은 단서입니다. 이상한 언어는 우연히 이상한 것이 아닙니다.적어도 좋은 것은 아닙니다.좋은 것의 이상한 점은 일반적으로 라이브러리 호출을 함께 붙이는 것이 아닌 어떤 형태의 프로그래밍이 존재한다는 것을 의미합니다. 구체적인 예: Lisp 매크로.Lisp 매크로는 많은 Lisp 프로그래머에게도 이상하게 보입니다.그들은 대중적인 언어의 교차점에 있을 뿐만 아니라 그 성격상 Lisp의 방언으로 바꾸지 않고는 언어에서 적절하게 구현하기 어려울 것입니다.그리고 매크로는 확실히 글루 프로그래밍을 넘어서는 기술의 증거입니다.예를 들어, 먼저 해당 유형의 문제에 대한 언어를 작성한 다음 그 언어로 특정 애플리케이션을 작성하여 문제를 해결합니다.또한 이것이 매크로로 할 수 있는 전부는 아닙니다.그것은 프로그램 조작 기술 공간의 한 영역일 뿐이며 지금도 완전히 탐구되지는 않습니다. 따라서 프로그래밍이 무엇인지에 대한 개념을 확장하고 싶다면 이상한 언어를 배우는 것이 한 가지 방법입니다.대부분의 프로그래머가 이상하다고 생각하지만 중간 사용자가 똑똑한 언어를 선택한 다음 이 언어와 인기 언어의 교차점 사이의 차이점에 집중하세요.다른 언어로 말하기가 불가능할 정도로 불편한 것을 이 언어로 말할 수 있습니까?이전에 말할 수 없었던 것을 말하는 방법을 배우는 과정에서, 이전에 생각하지 못했던 것을 생각하는 방법도 배우게 될 것입니다.초안을 읽어주신 Trevor Blackwell, Patrick Collison, Daniel Gackle, Amjad Masad 및 Robert Morris에게 감사드립니다.일본어 번역

---

## 원문 (Original Essay)

August 2021When people say that in their experience all programming languages are basically equivalent, they're making a statement not about languages but about the kind of programming they've done.99.5% of programming consists of gluing together calls to library functions. All popular languages are equally good at this. So one can easily spend one's whole career operating in the intersection of popular programming languages.But the other .5% of programming is disproportionately interesting. If you want to learn what it consists of, the weirdness of weird languages is a good clue to follow.Weird languages aren't weird by accident. Not the good ones, at least. The weirdness of the good ones usually implies the existence of some form of programming that's not just the usual gluing together of library calls.A concrete example: Lisp macros. Lisp macros seem weird even to many Lisp programmers. They're not only not in the intersection of popular languages, but by their nature would be hard to implement properly in a language without turning it into a dialect of Lisp. And macros are definitely evidence of techniques that go beyond glue programming. For example, solving problems by first writing a language for problems of that type, and then writing your specific application in it. Nor is this all you can do with macros; it's just one region in a space of program-manipulating techniques that even now is far from fully explored.So if you want to expand your concept of what programming can be, one way to do it is by learning weird languages. Pick a language that most programmers consider weird but whose median user is smart, and then focus on the differences between this language and the intersection of popular languages. What can you say in this language that would be impossibly inconvenient to say in others? In the process of learning how to say things you couldn't previously say, you'll probably be learning how to think things you couldn't previously think. Thanks to Trevor Blackwell, Patrick Collison, Daniel Gackle, Amjad Masad, and Robert Morris for reading drafts of this. Japanese Translation

---

_분석일: 2025. 11. 29._
_수집일: 2025. 11. 28._
