### overview

agent 프로젝트 frontend 초기화


### tasks

- npx create next.js
- chat interface
- front: local, backend: env.ip connect


### note

#### note 1

.env file에 'NEXT_PUBLIC_ADMIN_BACKEND_HOST="http://192.168.0.5:8000"' 로 환경변수 정의
docker-compose로 설정되어있지만 hybrid로 실행이 가능하도록 유연하게 설계
backend는 .env의 ip를 가지고 실행하고 ollama는 그런 backend와 localhost로 연결되어 docker compose up backend ollama를 실행
frontend는 다른 pc에서 docker compose up frontend로 localhost에 실행
이렇게 서로 다른 pc 환경에서 frontend와 backend, ollama가 실행되어있지만 docker compose로 연결된 network으로 서로 data 주고 받으며 통신하도록 설계
