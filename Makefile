# Simple Makefile for operator-ui development

# Default API URL for local development
API_URL ?= http://localhost:8421

.PHONY: dev
dev: ## Run development server with local API
	REACT_APP_API_BASE_URL=$(API_URL) npm start

.PHONY: build
build: ## Build for production
	npm run build

.PHONY: install
install: ## Install dependencies
	npm install