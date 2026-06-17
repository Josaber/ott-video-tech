.PHONY: help install db-up db-down temporal-up temporal-down backend backend-remote ad-service frontend test build smoke clean

help:
	@echo "OTT Video Tech Demo - common targets"
	@echo ""
	@echo "  make install      - install frontend dependencies"
	@echo "  make db-up        - start Postgres via docker compose"
	@echo "  make db-down      - stop Postgres"
	@echo "  make db-fresh     - destroy postgres volume + re-init (needed before first temporal-up if db existed)"
	@echo "  make temporal-up  - start real Temporal cluster (:7233) + UI (:8088)"
	@echo "  make temporal-down- stop Temporal cluster"
	@echo "  make ad-service   - run ad-service on :8090"
	@echo "  make backend      - run main backend on :8080 (embedded Temporal)"
	@echo "  make backend-remote - run main backend against the docker Temporal cluster"
	@echo "  make frontend     - run Vite dev server on :5173"
	@echo "  make test         - run backend + ad-service tests"
	@echo "  make build        - build all modules"
	@echo "  make smoke        - end-to-end smoke (boots stack, runs full publish flow, asserts manifest)"
	@echo "  make clean        - clean build artifacts and processed media"

install:
	cd frontend && npm install

db-up:
	docker compose up -d postgres

db-down:
	docker compose stop postgres

db-fresh:
	@echo "Destroying postgres + temporal data volumes. Re-runs first-boot init scripts."
	docker compose down -v
	docker compose up -d postgres

temporal-up:
	docker compose up -d temporal temporal-ui

temporal-down:
	docker compose stop temporal temporal-ui

ad-service:
	mvn -f ad-service/pom.xml spring-boot:run

backend:
	mvn -f backend/pom.xml spring-boot:run

backend-remote:
	APP_TEMPORAL_MODE=remote mvn -f backend/pom.xml spring-boot:run

frontend:
	cd frontend && npm run dev

test:
	mvn -f ad-service/pom.xml test
	mvn -f backend/pom.xml test

build:
	mvn -f ad-service/pom.xml -DskipTests package
	mvn -f backend/pom.xml -DskipTests package
	cd frontend && npm run build

smoke:
	bash scripts/smoke.sh

clean:
	mvn -f ad-service/pom.xml clean || true
	mvn -f backend/pom.xml clean || true
	rm -rf frontend/dist frontend/node_modules/.vite
	rm -rf backend/data ad-service/data
