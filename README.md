# labs linux agent

Linux 환경에서 실행되는 Docker 기반의 개인용 AI 에이전트 시스템입니다.

## system

- frontend
- backend
- ollama
- docker & docker-Compose

## features


## requirements

- linuxOS (ubuntu 24.04 LTS)
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) (use to nvidia gpu)

## how to run app

### env file

app을 실행하기 위해서는 project /에 .env 파일이 필요

### run app

```bash
docker compose up -d
```

### run hybrid app

``` bash
docker compose up -d backend ollama
docker compose up -d frontend
```

## project tree

```text
.
├── backend/            # FastAPI 기반 백엔드 API
│   ├── src/            # 소스 코드
│   └── pyproject.toml  # uv 기반 의존성 관리
├── frontend/           # Next.js 기반 프론트엔드
│   ├── src/
│   └── app/        # 페이지 라우팅
│   └── components/     # UI 컴포넌트
├── ollama/             # Ollama 모델 데이터 및 설정
├── public/docs/        # 개발 및 초기화 가이드 문서
└── docker-compose.yml  # 서비스 오케스트레이션 설정
```
