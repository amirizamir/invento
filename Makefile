.PHONY: help up up-dev down down-dev build logs ps reset seed test lint studio shell

help:
	@echo "VM Inventory Manager — Docker commands"
	@echo ""
	@echo "  make up       Production stack (postgres + init-db + app)"
	@echo "  make up-dev   Development stack with hot reload"
	@echo "  make down     Stop production stack"
	@echo "  make down-dev Stop development stack"
	@echo "  make build    Build production images"
	@echo "  make logs     Tail app logs"
	@echo "  make ps       Show containers"
	@echo "  make reset    Wipe DB volume and restart"
	@echo "  make seed     Re-run migration + seed"
	@echo "  make test     Run Jest tests in Docker"
	@echo "  make lint     Run ESLint in Docker"
	@echo "  make studio   Start Prisma Studio (:5555)"
	@echo "  make shell    Shell into app container"

ENV_FILE ?= .env.docker

up:
	docker compose --env-file $(ENV_FILE) up --build -d

up-dev:
	docker compose -f docker-compose.dev.yml --env-file $(ENV_FILE) up --build

down:
	docker compose --env-file $(ENV_FILE) down

down-dev:
	docker compose -f docker-compose.dev.yml --env-file $(ENV_FILE) down

build:
	docker compose --env-file $(ENV_FILE) build

logs:
	docker compose --env-file $(ENV_FILE) logs -f app

ps:
	docker compose --env-file $(ENV_FILE) ps -a

reset:
	docker compose --env-file $(ENV_FILE) down -v
	docker compose --env-file $(ENV_FILE) up --build -d

seed:
	docker compose --env-file $(ENV_FILE) run --rm init-db

test:
	docker compose --env-file $(ENV_FILE) --profile tools run --rm test

lint:
	docker compose --env-file $(ENV_FILE) --profile tools run --rm lint

studio:
	docker compose --env-file $(ENV_FILE) --profile tools up -d postgres studio

shell:
	docker compose --env-file $(ENV_FILE) exec app sh
