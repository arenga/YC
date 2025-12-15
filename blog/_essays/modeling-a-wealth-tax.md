---
layout: essay
title: "Modeling a Wealth Tax"
category: Mindset
difficulty: 중급
year: 
url_original: "https://paulgraham.com/wtax.html"
---

## 요약 (Summary)

🎯 부유세가 창업자의 지분을 얼마나 잠식할까요?

✨ 핵심 내용 요약

정치인들이 제안하는 부유세(Wealth Tax)가 스타트업 창업자에게 어떤 영향을 미칠지 시뮬레이션해보면 놀라운 결과가 나옵니다. 20대에 성공적인 스타트업을 창업하고 60년을 더 산다고 가정했을 때, 연 1%의 부유세는 60년간 자산의 45%를 가져갑니다. 3%라면? 83%가 사라집니다. 5%라면 거의 모든 것을 잃습니다.

문제는 부유세가 자산 "가치"에 부과되지만 주식은 팔기 어렵다는 점입니다. 특히 창업자는 회사 지분을 계속 보유해야 하는데, 매년 세금을 내려면 주식을 팔아야 합니다. 복리로 작용하면서 결국 창업자는 자신이 만든 회사의 소유권을 잃게 됩니다. 부유세는 표면상 공평해 보이지만, 실제로는 혁신과 창업을 가장 크게 억제하는 정책입니다.

**핵심 포인트**
• 부유세는 복리로 작용하여 자산을 기하급수적으로 잠식합니다
• 주식은 현금화하기 어려운데 세금은 현금으로 내야 합니다
• 창업자가 자신이 만든 회사의 소유권을 잃게 만듭니다

🚀 오늘 바로 실천해볼 한 가지
정책이 장기적으로 어떤 인센티브를 만들어내는지 복리 효과를 고려해 분석해보세요.

---

## 한국어 번역 (Korean Translation)

2020년 8월

일부 정치인들은 소득세와 양도소득세에 부유세를 도입하자고 제안하고 있습니다. 다양한 수준의 부유세의 효과를 모델링하여 스타트업 창업자에게 실제로 어떤 의미가 있는지 살펴보겠습니다.

20대에 성공적인 스타트업을 시작하고 앞으로 60년을 더 산다고 가정해 보겠습니다. 부유세가 당신의 주식 중 얼마나 소비하게 될까요?

부유세가 당신의 모든 자산에 적용된다면 그 효과를 쉽게 계산할 수 있습니다. 부유세 1%는 매년 주식의 99%를 보유할 수 있다는 의미입니다. 60년 후에는 남아 있는 주식 비율이 .99^60, 즉 .547이 됩니다. 따라서 1% 부유세는 정부가 평생 동안 주식의 45%를 가져간다는 것을 의미합니다.

(주당 가치가 부유세율보다 적게 증가하지 않는 한, 주식을 잃는다고 해서 순 빈곤층이 되는 것은 아닙니다.)

다음은 다양한 부유세 수준에서 정부가 60년 동안 가져갈 주식의 양입니다.

- 부유세 0.1% → 정부가 6%를 가져감
- 부유세 0.5% → 정부가 26%를 가져감
- 부유세 1.0% → 정부가 45%를 가져감
- 부유세 2.0% → 정부가 70%를 가져감
- 부유세 3.0% → 정부가 84%를 가져감
- 부유세 4.0% → 정부가 91%를 가져감
- 부유세 5.0% → 정부가 95%를 가져감

부유세에는 일반적으로 세금이 시작되는 기준점이 있습니다. 임계값이 높으면 얼마나 차이가 날까요? 이를 모델링하려면 주식의 초기 가치와 성장률에 대해 몇 가지 가정을 해야 합니다.

주식의 초기 가치가 200만 달러이고 회사의 궤적은 다음과 같다고 가정합니다: 주식 가치는 2년 동안 3배, 2년 동안 2배, 2년 동안 50% 증가한 후 일반적인 상장 회사 성장률을 얻습니다. 이를 8%라고 하겠습니다. [1]

부유세 기준액이 5천만 달러라고 가정해 보겠습니다. 지금 정부는 얼마나 많은 주식을 가져가나요?

- 부유세 0.1% → 정부가 5%를 가져감
- 부유세 0.5% → 정부가 23%를 가져감
- 부유세 1.0% → 정부가 41%를 가져감
- 부유세 2.0% → 정부가 65%를 가져감
- 부유세 3.0% → 정부가 79%를 가져감
- 부유세 4.0% → 정부가 88%를 가져감
- 부유세 5.0% → 정부가 93%를 가져감

그렇게 작은 세율이 그렇게 극적인 효과를 낳는다는 것이 처음에는 놀랍게 보일 수 있습니다. 5천만 달러 한도의 2% 부유세는 성공적인 창업자 주식의 약 3분의 2를 차지합니다.

부유세가 그토록 극적인 효과를 갖는 이유는 동일한 돈에 반복해서 적용되기 때문입니다. 소득세는 매년 발생하지만 해당 연도의 소득에만 부과됩니다. 반면에 자산을 취득한 후 60년 동안 산다면, 부유세는 해당 자산에 60배의 세금을 부과하게 됩니다. 부유세는 복리로 작용합니다.

**참고**

[1] 실제로 이 8% 중 일부는 배당금 형태로 제공되며 이는 소득으로 과세되므로, 이 모델은 실제로 창업자에게 가장 낙관적인 사례를 나타냅니다.

---

## 원문 (Original Essay)

August 2020Some politicians are proposing to introduce wealth taxes in addition to income and capital gains taxes. Let's try modeling the effects of various levels of wealth tax to see what they would mean in practice for a startup founder.Suppose you start a successful startup in your twenties, and then live for another 60 years. How much of your stock will a wealth tax consume?If the wealth tax applies to all your assets, it's easy to calculate its effect. A wealth tax of 1% means you get to keep 99% of your stock each year. After 60 years the proportion of stock you'll have left will be .99^60, or .547. So a straight 1% wealth tax means the government will over the course of your life take 45% of your stock.(Losing shares does not, obviously, mean becoming net poorer unless the value per share is increasing by less than the wealth tax rate.)Here's how much stock the government would take over 60 years at various levels of wealth tax: wealth taxgovernment takes 0.1%6%0.5%26% 1.0%45% 2.0%70% 3.0%84% 4.0%91%5.0%95% A wealth tax will usually have a threshold at which it starts. How much difference would a high threshold make? To model that, we need to make some assumptions about the initial value of your stock and the growth rate.Suppose your stock is initially worth $2 million, and the company's trajectory is as follows: the value of your stock grows 3x for 2 years, then 2x for 2 years, then 50% for 2 years, after which you just get a typical public company growth rate, which we'll call 8%. [1] Suppose the wealth tax threshold is $50 million. How much stock does the government take now? wealth taxgovernment takes 0.1%5%0.5%23% 1.0%41% 2.0%65% 3.0%79% 4.0%88%5.0%93% It may at first seem surprising that such apparently small tax rates produce such dramatic effects. A 2% wealth tax with a $50 million threshold takes about two thirds of a successful founder's stock.The reason wealth taxes have such dramatic effects is that they're applied over and over to the same money. Income tax happens every year, but only to that year's income. Whereas if you live for 60 years after acquiring some asset, a wealth tax will tax that same asset 60 times. A wealth tax compounds.Note[1] In practice, eventually some of this 8% would come in the form of dividends, which are taxed as income at issue, so this model actually represents the most optimistic case for the founder.

---

_분석일: 2025. 11. 29._
_수집일: 2025. 11. 28._