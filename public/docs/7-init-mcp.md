### overview

agent 프로젝트 mcp 초기화


### tasks

- mcp server
- mcp client : google calendar


### note

#### note 1

user가 ollama에게 request를 전달하면 ollama는 user.request의 맥락을 이해한 뒤, 필요하다면 mcp server에 가고 mcp server의 client 중 적절한 곳을 골라 docker sdk로 container 실행하고 값을 response
기본적으로 mcp server는 계속 실행되지만 mcp client는 필요한 순간에 container를 실행하고 역할을 다하면 container가 종료되는 형태로 동작하며 이러한 동작은 docker sdk를 이용

가장 먼저 추가하는 mcp client는 google calendar
