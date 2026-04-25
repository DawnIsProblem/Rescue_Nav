# OSM Ingestion Skeleton

## 목적

이 디렉토리는 OSM 데이터를 Rescue Nav용 그래프 CSV로 변환하는 최소 적재 골격을 담는다.

현재 스크립트:

- `osm_ingest.py`

이 스크립트는 다음까지만 처리한다.

1. OSM XML 읽기
2. 라우팅 가능한 도로 필터링
3. 최소 node/edge/tag 그래프 생성
4. Supabase 스키마에 맞는 CSV 출력
5. 검증 리포트 출력

## 왜 이 스크립트가 먼저 필요한가

긴급경로 엔진은 그래프 데이터가 있어야 테스트할 수 있다.

즉, 엔진 구현 전에 아래가 먼저 있어야 한다.

- 익산 도로 데이터를 읽는 흐름
- node/edge로 바꾸는 흐름
- Supabase에 넣을 수 있는 산출물

이 스크립트는 그 첫 단계다.

## 현재 한계

- `.osm` XML만 지원
- `.pbf` 미지원
- 직접 Supabase insert 미지원
- node/edge 분할 규칙이 최소 수준
- edge tag가 아직 `osm_way_id` 기준으로만 출력됨
- manual override merge 미포함

즉, 이 파일은 “생산용 완성본”이 아니라 “데이터 흐름을 검증하는 최소 골격”이다.

## 실행 예시

```bash
python3 pipeline/osm_ingest.py \
  --input data/raw/osm/iksan.osm \
  --output-dir data/output/iksan_v1 \
  --version-name iksan_osm_2026_04_20_v1 \
  --region-name Iksan \
  --region-code KR-45-IKSAN \
  --snapshot-date 2026-04-20
```

## 출력 파일

- `road_graph_version.csv`
- `road_graph_nodes.csv`
- `road_graph_edges.csv`
- `road_graph_edge_tags.csv`
- `validation_report.json`

## 다음 개선 우선순위

1. `.pbf` 지원
2. 교차점 중심 node 분할 고도화
3. edge-level tag 정합성 보강
4. manual override merge
5. Supabase bulk load 연결
