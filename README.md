# Labs Linux Agent

Linux 환경에서 실행되는 Docker 기반의 개인용 AI 에이전트 시스템입니다.

## 🚀 프로젝트 개요

이 프로젝트는 로컬 LLM(Ollama)과 최신 웹 기술 스택(Next.js, FastAPI)을 결합하고, MCP(Model Context Protocol)를 통해 외부 도구와 연동되는 개인용 AI 에이전트 환경을 구축하는 것을 목표로 합니다.

## 🛠 시스템 아키텍처

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI (Python 3.12, `uv` 패키지 매니저)
- **AI Engine**: Ollama (NVIDIA GPU 가속 지원)
- **MCP Infrastructure**: Node.js 기반 MCP Server 및 Clients
- **Orchestration**: Docker & Docker-Compose

## ✨ 주요 기능

- **Intelligent Chat Interface**: Shadcn UI 기반의 세련된 채팅 UI
- **Local LLM Integration**: Ollama를 통한 로컬 모델 실행 (`gemini-3-flash-preview` 등)
- **MCP Tools**: Docker 관리 및 Google Calendar 연동 등을 위한 확장 가능한 도구 시스템
- **GPU Acceleration**: NVIDIA 컨테이너 툴킷을 이용한 하드웨어 가속
- **Hybrid Deployment**: 분산 환경에서도 유연하게 동작하는 네트워크 구조

## 📋 사전 준비 사항

- Linux OS (Ubuntu 24.04 LTS 추천)
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) (GPU 가속 사용 시)

## ⚙️ 설정 및 실행 방법

### 1. 환경 변수 설정

루트 디렉토리에 `.env` 파일을 생성하고 필요한 정보를 입력합니다.

```env
# Ollama 설정
OLLAMA_DATA=./ollama/data
GOOGLE_API_KEY=your_google_api_key_here

# 백엔드 설정
ALLOWED_ORIGINS=*

# 프론트엔드 설정
NEXT_PUBLIC_ADMIN_BACKEND_HOST=localhost

# MCP 설정
PORT=3001 # mcp-server
```

### 2. 서비스 실행

```bash
# 전체 서비스 실행
docker-compose up -d

# 특정 서비스만 실행
docker-compose up -d backend ollama mcp-server
```

## 📁 프로젝트 구조

```text
.
├── backend/            # FastAPI 기반 백엔드 API
├── frontend/           # Next.js 기반 프론트엔드
├── mcp/                # MCP (Model Context Protocol) 서비스
│   ├── server/         # Node.js 기반 핵심 MCP 서버 (Docker 관리 등)
│   └── clients/        # 특정 기능을 위한 MCP 서비스 (Google Calendar 등)
├── ollama/             # Ollama 모델 데이터 및 설정
├── public/docs/        # 개발 가이드 문서
└── docker-compose.yml  # 서비스 오케스트레이션 설정
```

### 4. Google Calendar 연동 (선택 사항)

Google Calendar 기능을 사용하려면 최초 1회 인증이 필요합니다.

1.  모든 서비스를 실행합니다: `docker-compose up -d`
2.  브라우저에서 `http://localhost:3002/auth`에 접속합니다.
3.  Google 계정으로 로그인하고 권한을 승인합니다.
4.  인증이 완료되면 이제 채팅에서 "내 일정 알려줘"와 같은 메시지로 구글 캘린더 조회가 가능합니다.

---
Powered by Next.js, FastAPI, Ollama, and MCP SDK.
