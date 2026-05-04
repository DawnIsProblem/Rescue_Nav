# Rescue_Nav

Rescue_Nav는 긴급 출동 상황에서 일반 경로와 긴급 경로를 함께 계산하고 비교할 수 있도록 만든 내비게이션 프로젝트입니다. 현재 구조는 React/Vite 프론트엔드와 Spring Boot 백엔드로 나뉘며, 긴급 경로는 OSM 기반 그래프와 A* 탐색을 이용해 계산합니다.

현재 기준 핵심 특징은 다음과 같습니다.
- 일반 경로: Kakao Mobility API 기반 계산
- 긴급 경로: OSM 그래프 + A* 기반 계산
- fallback: OSM 그래프 계산 실패 시 heuristic / standard fallback 사용
- 메타데이터: strategy, confidence, legalWarning, fallbackReason 등 응답 포함
- 성능 최적화: snapshot(`road_graph_snapshot.json.gz`) preload 방식 적용
- 검증: 익산 고정 시나리오 10건 기준 동작 확인

## 프로젝트 구조

```text
Rescue_Nav/
├─ Frontend/   # React 19 + TypeScript + Vite
└─ Backend/    # Spring Boot 3.5 + Gradle
```

## 기술 스택

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router DOM
- Zustand
- Supabase JavaScript SDK
- Kakao Map SDK

### Backend
- Java 21
- Spring Boot 3.5
- Spring Web
- Spring Validation
- Spring WebFlux
- Springdoc OpenAPI
- Gradle

### Routing / Data
- Kakao Local API
- Kakao Mobility API
- OpenStreetMap (OSM)
- Snapshot-based graph preload (`.json.gz`)
- A* pathfinding
- Supabase (dispatch/history/storage integration basis)

## 핵심 기능

- 목적지 검색
- 일반 경로 / 긴급 경로 동시 계산
- 차량 유형별 경로 계산
- 긴급 경로 fallback 사유 반환
- 경로 비교 UI
- 출동 이력 저장 및 조회
- Swagger UI 기반 API 확인

## 현재 경로 계산 구조

```text
Frontend (React/Vite)
  ├─ Kakao Map SDK
  ├─ Supabase (dispatch/history)
  └─ /api proxy
       ↓
Backend (Spring Boot)
  ├─ /api/places/search
  ├─ /api/routes/calculate
  ├─ StandardRoutePlanner
  │    └─ Kakao Mobility API
  ├─ CompositeEmergencyRoutePlanner
  │    ├─ OSM Graph Emergency Route Planner (A*)
  │    └─ Heuristic fallback planner
  └─ SnapshotRoadGraphLoader
       └─ road_graph_snapshot.json.gz preload
```

개발 환경에서는 Vite dev server가 `/api` 요청을 `http://localhost:8080`으로 프록시합니다.

## 프론트 라우트

- `/` : 랜딩 페이지
- `/main-map` : 메인 지도 페이지
- `/dashboard` : 경로 계산 / 출동 대시보드
- `/dispatch` : `/dashboard?view=dashboard`로 리다이렉트
- `/history` : `/dashboard?view=history`로 리다이렉트
- `/support` : 사용 안내 페이지

## 실행 전 준비

### 공통 요구 사항
- Node.js / npm
- Java 21
- Kakao REST API Key
- Kakao JavaScript Key
- Supabase 프로젝트 정보

### Frontend 환경 변수

`Frontend/.env` 파일 예시:

```env
VITE_KAKAO_MAP_KEY=YOUR_KAKAO_JAVASCRIPT_KEY
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# optional
VITE_SUPABASE_DISPATCH_TABLE=dispatch_history
VITE_SUPABASE_ROUTE_RESULT_TABLE=route_result
VITE_SUPABASE_DISPATCH_STATUS_ONGOING=ONGOING
VITE_SUPABASE_DISPATCH_STATUS_COMPLETED=ARRIVED
VITE_SUPABASE_DISPATCH_STATUS_CANCELED=CANCELLED
```

### Backend 환경 변수

백엔드는 `Backend/.env.properties`를 통해 설정을 읽습니다.

snapshot 기반 현재 권장 설정:

```properties
SPRING_PROFILES_ACTIVE=local
KAKAO_REST_API_KEY=YOUR_KAKAO_REST_API_KEY
KAKAO_LOCAL_BASE_URL=https://dapi.kakao.com
KAKAO_MOBILITY_BASE_URL=https://apis-navi.kakaomobility.com
KAKAO_REQUEST_TIMEOUT_MILLIS=5000

ROUTE_GRAPH_ENABLED=true
ROUTE_GRAPH_SOURCE=snapshot
ROUTE_GRAPH_SNAPSHOT_PATH=data/output/iksan_current/road_graph_snapshot.json.gz
ROUTE_GRAPH_PRELOAD_ON_STARTUP=true

SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## OSM snapshot 생성

현재 백엔드는 Supabase row preload보다 snapshot preload를 기본 권장 방식으로 사용합니다.

익산 OSM 파일이 준비되어 있다면:

```bash
cd Backend
python3 pipeline/osm_ingest.py \
  --input data/raw/osm/iksan.osm \
  --output-dir data/output/iksan_current \
  --version-name iksan_osm_2026_04_23_v1 \
  --region-name Iksan \
  --region-code KR-45-IKSAN \
  --snapshot-date 2026-04-23
```

생성 결과 예시:
- `data/output/iksan_current/road_graph_snapshot.json.gz`
- `data/output/iksan_current/validation_report.json`

현재 실행에는 `road_graph_snapshot.json.gz`가 핵심이며, CSV는 import/디버깅용 산출물입니다.

## 실행 방법

### 1. Backend 실행

```bash
cd Backend
./gradlew bootRun
```

기본 주소:
- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 2. Frontend 실행

```bash
cd Frontend
npm install
npm run dev
```

기본 주소:
- Web: `http://localhost:5173`

## 개발 명령어

### Frontend

```bash
cd Frontend
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```bash
cd Backend
./gradlew bootRun
./gradlew test
./gradlew build
```

## API 요약

### 목적지 검색
- `GET /api/places/search?query=...`
- 검색어를 기반으로 목적지 후보를 반환합니다.

### 경로 계산
- `POST /api/routes/calculate`
- 출발지, 목적지, 차량 종류를 받아 일반 경로와 긴급 경로를 함께 계산합니다.

예시 요청:

```json
{
  "origin": { "lat": 35.95, "lng": 126.96 },
  "destination": {
    "address": "익산 테스트 목적지",
    "zonecode": "54538",
    "lat": 35.9485,
    "lng": 126.964
  },
  "vehicleType": "FIRE_TRUCK"
}
```

응답의 긴급 경로 메타데이터에는 아래 정보가 포함될 수 있습니다.
- `strategy`
- `confidence`
- `legalWarning`
- `reason`
- `assumptions`
- `fallbackUsed`
- `fallbackReason`
- `fallbackMessage`
- `primaryStrategy`
- `fallbackStrategy`

## 테스트 및 검증

백엔드에는 다음 테스트 축이 포함됩니다.
- MockMvc API 통합 테스트
- OSM graph planner 테스트
- graph warmup / loader 테스트
- fallback 메타데이터 반영 테스트

프론트는 빌드와 린트 중심으로 검증합니다.

추가로 익산 고정 시나리오 10건을 사용해 실제 경로 계산 검증을 수행할 수 있습니다.

```bash
cd Backend
python3 scripts/run_route_scenarios.py http://localhost:8080 scripts/iksan_route_scenarios.json
```

## 현재 상태 요약

현재 프로젝트는 다음 상태까지 구현되었습니다.
- 일반 경로 / 긴급 경로 분리
- OSM 기반 긴급경로 엔진 적용
- fallback 사유 구조화
- snapshot preload 최적화
- 익산 10개 시나리오 검증 완료

즉, 포트폴리오 기준으로는 높은 완성도에 도달했고, 지역 단위 시범 서비스 수준의 구조를 갖춘 상태입니다.

## 한계 및 주의사항

- 현재 OSM 그래프와 시나리오 검증은 익산 기준으로 진행되었습니다.
- 긴급 경로는 현장 판단을 대체하지 않으며, 최종 판단은 현장 상황을 우선해야 합니다.
- 일방통행 도로의 역주행은 현재 모델에서 제외됩니다.
- 실시간 교통, 통제, 공사, 사고 데이터는 아직 반영하지 않습니다.
- 전국 확장 시에는 단일 snapshot이 아니라 지역/타일 단위 graph 운영 전략이 필요합니다.

## 참고

- 프론트엔드는 개발 시 `/api` 요청을 백엔드로 프록시합니다.
- Supabase는 현재 출동 이력/운영 데이터 및 향후 graph version 관리 기반으로 사용됩니다.
- 기존 `Frontend/README.md`, `Backend/README.md`보다 루트 `README.md`를 우선 참고하는 것이 좋습니다.
