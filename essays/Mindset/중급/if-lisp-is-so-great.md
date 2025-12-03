# If Lisp is So Great
**카테고리**: Mindset
**난이도**: 중급
**출판일**: N/A
**원문**: https://paulgraham.com/iflisp.html
---
## 요약 (Summary)

🎯 Lisp이 그렇게 좋다면 왜 안 쓰나요?

✨ 핵심 내용 요약

Paul Graham은 Lisp(프로그래밍 언어)을 사랑합니다. 하지만 대부분 사람은 안 씁니다. 왜일까요?

Graham의 답: **Lisp은 너무 강력해서 위험합니다**. Lisp은 매우 유연합니다. 언어 자체를 수정할 수 있습니다. 하지만 이게 문제입니다: 각 프로그래머가 자기만의 Lisp을 만듭니다. 결과: 코드를 이해하기 어렵습니다. 반면 Java 같은 언어는 덜 강력하지만 표준화되어 있습니다. 누구든 읽을 수 있습니다. 스타트업 교훈: **강력한 도구가 항상 좋은 건 아닙니다**. 때로는 "충분히 좋은" 도구가 더 낫습니다. 팀이 함께 쓸 수 있으니까요.

**핵심 포인트**
• Lisp은 강력하지만 표준화가 어렵습니다
• 강력한 도구가 항상 좋은 건 아닙니다
• 팀이 함께 쓸 수 있는 도구가 중요합니다

🚀 오늘 바로 실천해볼 한 가지
"가장 강력한 도구"보다 "팀이 가장 잘 아는 도구"를 선택하세요.

---

## 한국어 번역 (Korean Translation)

2003년 5월Lisp가 이렇게 훌륭하다면 왜 더 많은 사람들이 사용하지 않는 걸까요?최근 강연에서 청중에 있던 한 학생이 이런 질문을 했습니다.처음도 아닙니다. 많은 경우와 마찬가지로 언어에서도 인기와 품질 사이에는 큰 상관관계가 없습니다.John Grisham(King of Torts 판매 순위, 44)이 Jane Austen(오만과 편견 판매 순위, 6191)보다 더 많이 팔리는 이유는 무엇입니까?그리샴조차도 자신이 더 나은 작가이기 때문이라고 주장할까요? 오만과 편견의 첫 번째 문장은 다음과 같습니다. 행운을 누리고 있는 독신 남성에게는 아내가 부족하다는 것은 보편적으로 인정되는 진실입니다."그것은 보편적으로 인정되는 사실인가?"러브 스토리의 첫 문장에 대한 긴 단어. Jane Austen처럼 Lisp도 딱딱해 보입니다.구문 또는 구문 부족으로 인해 대부분의 사람들이 익숙한 언어와 완전히 다르게 보입니다.Lisp를 배우기 전에는 나도 Lisp를 두려워했습니다.나는 최근에 다음과 같이 쓴 1983년의 노트를 발견했습니다. Lisp를 배워야 할 것 같지만 너무 낯설게 보입니다.다행스럽게도 나는 당시 19세였고 새로운 것을 배우는 데 그다지 저항하지 않았습니다.나는 너무 무지해서 거의 모든 것을 배우는 것은 새로운 것을 배우는 것을 의미했습니다. Lisp를 두려워하는 사람들은 Lisp를 사용하지 않는 다른 이유를 만듭니다.C가 기본 언어였을 때 표준적인 변명은 Lisp가 너무 느리다는 것이었습니다.이제 Lisp 방언은 사용 가능한 가장 빠른 언어 중 하나이므로 그러한 변명은 사라졌습니다.이제 표준적인 변명은 공개적으로 순환적입니다. 즉, 다른 언어가 더 인기가 있다는 것입니다. (그러한 추론을 조심하십시오. Windows를 얻게 됩니다.) 인기는 항상 저절로 지속되지만 프로그래밍 언어에서는 특히 그렇습니다.더 많은 라이브러리가 인기 있는 언어로 작성되어 더욱 인기를 얻고 있습니다.프로그램은 기존 프로그램과 함께 작동해야 하는 경우가 많으며 동일한 언어로 작성되면 더 쉽습니다. 따라서 언어는 바이러스처럼 프로그램에서 프로그램으로 퍼집니다.그리고 관리자는 대중적인 언어를 선호합니다. 개발자보다 더 쉽게 대체할 수 있는 영향력이 더 크기 때문입니다. 실제로 프로그래밍 언어가 모두 어느 정도 동일하다면 가장 인기 있는 언어 외에는 어떤 것도 사용할 정당성이 거의 없을 것입니다.그러나 그것들은 모두 동등하지 않습니다.이것이 바로 Jane Austen의 소설과 같이 덜 인기 있는 언어가 계속해서 살아남는 이유입니다.모두가 John Grisham의 최신 소설을 읽을 때 대신 Jane Austen을 읽는 사람은 항상 몇 명 있을 것입니다.일본어 번역루마니아어 번역스페인어 번역

---

## 원문 (Original Essay)

May 2003If Lisp is so great, why don't more people use it? I was asked this question by a student in the audience at a talk I gave recently. Not for the first time, either.In languages, as in so many things, there's not much correlation between popularity and quality. Why does John Grisham (King of Torts sales rank, 44) outsell Jane Austen (Pride and Prejudice sales rank, 6191)? Would even Grisham claim that it's because he's a better writer?Here's the first sentence of Pride and Prejudice: It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife. "It is a truth universally acknowledged?" Long words for the first sentence of a love story.Like Jane Austen, Lisp looks hard. Its syntax, or lack of syntax, makes it look completely unlike the languages most people are used to. Before I learned Lisp, I was afraid of it too. I recently came across a notebook from 1983 in which I'd written: I suppose I should learn Lisp, but it seems so foreign. Fortunately, I was 19 at the time and not too resistant to learning new things. I was so ignorant that learning almost anything meant learning new things.People frightened by Lisp make up other reasons for not using it. The standard excuse, back when C was the default language, was that Lisp was too slow. Now that Lisp dialects are among the faster languages available, that excuse has gone away. Now the standard excuse is openly circular: that other languages are more popular.(Beware of such reasoning. It gets you Windows.)Popularity is always self-perpetuating, but it's especially so in programming languages. More libraries get written for popular languages, which makes them still more popular. Programs often have to work with existing programs, and this is easier if they're written in the same language, so languages spread from program to program like a virus. And managers prefer popular languages, because they give them more leverage over developers, who can more easily be replaced.Indeed, if programming languages were all more or less equivalent, there would be little justification for using any but the most popular. But they aren't all equivalent, not by a long shot. And that's why less popular languages, like Jane Austen's novels, continue to survive at all. When everyone else is reading the latest John Grisham novel, there will always be a few people reading Jane Austen instead.Japanese TranslationRomanian TranslationSpanish Translation

---

_분석일: 2025. 11. 29._
_수집일: 2025. 11. 28._
