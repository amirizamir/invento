.PHONY: help up up-dev down down-dev build logs ps reset seed test lint studio deploy

help:
	@echo "VM Inventory Manager — Docker commands (Linux)"
	@echo ""
	@echo "  make deploy    Run ./deploy.sh (recommended)"
	@echo "  make up        docker compose up -d --build"
	@echo "  make down      docker compose down"
	@echo "  make logs      Tail app logs"
	@echo "  make ps        Container status"
	@echo "  make reset     Stop and remove volumes, redeploy"
	@echo "  make bootstrap Re-run DB schema + admin bootstrap"
	@echo "  make test      Run tests in Docker"
	@echo "  make lint      Run ESLint in Docker"
	@echo "  make studio    Start Prisma Studio"

deploy:
	@chmod +x deploy.sh && ./deploy.sh

up:
	docker compose up -d --build

up-dev:
	docker compose -f docker-compose.dev.yml up --build

down:
	docker compose down

down-dev:
	docker compose -f docker-compose.dev.yml down

build:
	docker compose build

logs:
	docker compose logs -f app

ps:
	docker compose ps -a

reset:
	docker compose down
	rm -rf ./data
	docker compose up -d --build

bootstrap:
	docker compose run --rm init-db

test:
	docker compose --profile tools run --rm test

lint:
	docker compose --profile tools run --rm lint

studio:
	docker compose --profile tools up -d postgres studio
