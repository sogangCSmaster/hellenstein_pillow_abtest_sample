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
- `generated-cuts/`: imagegen으로 생성한 PNG 원본 컷
- `proposal/`: GTM에서 사용할 WebP 배포용 이미지 컷
- `gtm/hellenstein-pillow-abtest.custom-html.html`: GTM Custom HTML 태그 본문
- `detail.html`: 실제 상세페이지 소스를 로컬에 저장한 참고 파일
- `hellenstein-pdp-redesign-v3.pptx`: 제안 구조의 기준이 된 발표 자료

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
- Hero 이후 리뷰 요약 모듈
- 하단 Sticky CTA
- `detail=true`일 때 PPTX 기반 설명 패널

이미지 URL은 레포를 `main` 브랜치에 push한 뒤 아래 형태로 사용됩니다.

```text
https://raw.githubusercontent.com/sogangCSmaster/hellenstein_pillow_abtest_sample/main/proposal/01-hero.webp
```
