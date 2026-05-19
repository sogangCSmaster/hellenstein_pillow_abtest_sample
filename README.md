# Hellenstein Pillow PDP AB Test Sample

헬렌스타인 `내 목의 베개` 상세페이지 제안용 GTM 샘플입니다.

대상 URL:

```text
https://hellenstein.co.kr/product/detail.html?product_no=8461&cate_no=906&display_group=1
```

## URL Modes

제안 랜딩만 보기:

```text
https://hellenstein.co.kr/product/detail.html?product_no=8461&cate_no=906&display_group=1&abtest=true&detail=false
```

제안 랜딩 + 변경 이유 보기:

```text
https://hellenstein.co.kr/product/detail.html?product_no=8461&cate_no=906&display_group=1&abtest=true&detail=true
```

## Folder Structure

- `original/`: 현재 상세페이지 본문 이미지 36개를 실제 페이지에서 순서대로 다운로드한 원본 백업
- `assets/generated/`: imagegen으로 만든 라이프스타일 원본 컷
- `proposal/`: GTM에서 사용할 WebP 배포용 이미지 컷과 `manifest.json`
- `docs/pptx-strategy.md`: PPTX 12블록을 실제 PDP 구조로 재해석한 기준 문서
- `scripts/build-proposal-assets.js`: 원본/생성 이미지를 조합해 배포용 컷과 컨택트시트를 만드는 빌드 스크립트
- `gtm/hellenstein-pillow-abtest.custom-html.html`: GTM Custom HTML 태그 본문
- `detail.html`: 실제 상세페이지 소스를 로컬에 저장한 참고 파일
- `hellenstein-pdp-redesign-v3.pptx`: 제안 구조의 기준이 된 발표 자료

## Asset Build

이미지 컷은 클릭 요소를 포함하지 않습니다. 텍스트가 필요한 경우에도 고객에게 보이는 정확한 카피만 빌드 스크립트에서 렌더링합니다.

```bash
NODE_PATH=/Users/yuseungjae/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
/Users/yuseungjae/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/build-proposal-assets.js
```

## Strategy Sources

- `hellenstein-pdp-redesign-v3.pptx`: 제안 근거와 12블록 구조
- `.agents/skills/`: `npx skills add coreyhaines31/marketingskills`로 설치한 마케팅 skill
- 적용 중심 skill: `cro`, `ab-testing`, `product-marketing`, `copywriting`, `marketing-psychology`, `analytics`

## GTM Setup

1. GTM에서 `Custom HTML` 태그를 새로 만든다.
2. [gtm/hellenstein-pillow-abtest.custom-html.html](gtm/hellenstein-pillow-abtest.custom-html.html)의 내용을 그대로 붙여넣는다.
3. 트리거는 Page View 기준으로 아래 조건을 모두 만족하게 설정한다.
   - Page URL contains `product_no=8461`
   - Page URL contains `abtest=true`
4. `detail=true` 여부는 태그 내부에서 URL 파라미터를 읽어 자동 분기한다.

## Implementation Boundary

이미지는 정적인 상세페이지 컷만 담당합니다.

클릭 가능한 요소는 이미지 안에 넣지 않고 GTM HTML로 삽입합니다.

- 상품 정보 영역 상단 신뢰 모듈
- Solution 이후 실제 리뷰 요약 모듈
- 비교표, 적응 기간 안내, 구매 전 확인 기준
- PC 조건부 Sticky CTA
- 모바일 기본 Cafe24 구매바 유지
- `detail=true`일 때 PPTX 기반 설명 패널

GTM은 `#prdDetail .prdimages`만 바꾸는 방식이 아니라, 상세 추가정보 영역을
`.detailArea` 바깥의 full-width shell로 옮겨 PC에서도 제안 PDP 본문이 1000px
중심 정렬 상세페이지처럼 보이게 합니다. 구매 폼, 옵션, 장바구니, 구매 버튼은
기존 Cafe24 영역을 그대로 사용합니다.

GTM 태그는 아래 이벤트를 `dataLayer`에 push합니다.

- `hellenstein_pillow_abtest_rendered`
- `hellenstein_pillow_abtest_sticky_cta_click`
- `hellenstein_pillow_abtest_review_jump_click`
- `hellenstein_pillow_abtest_layout_fallback`

이미지 URL은 레포를 `main` 브랜치에 push한 뒤 아래 형태로 사용됩니다.

```text
https://raw.githubusercontent.com/sogangCSmaster/hellenstein_pillow_abtest_sample/main/proposal/01-hero.webp
```
