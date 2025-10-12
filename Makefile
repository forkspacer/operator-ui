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

##@ Version Management

.PHONY: update-version
update-version: ## Update version in Helm chart. Usage: make update-version VERSION=v1.0.1
	@if [ -z "$(VERSION)" ]; then \
		echo "❌ Error: VERSION not specified. Usage: make update-version VERSION=v1.0.1"; \
		exit 1; \
	fi
	@echo "🔄 Updating operator-ui to $(VERSION)..."
	@CHART_VERSION=$${VERSION#v}; \
	sed -i.bak "s/^version: .*/version: $$CHART_VERSION/" helm/Chart.yaml
	@sed -i.bak "s/^appVersion: .*/appVersion: \"$(VERSION)\"/" helm/Chart.yaml
	@sed -i.bak "s/tag: \".*\"/tag: \"$(VERSION)\"/" helm/values.yaml
	@sed -i.bak "s/^VERSION ?= .*/VERSION ?= $(VERSION)/" Makefile
	@rm -f helm/Chart.yaml.bak helm/values.yaml.bak Makefile.bak
	@echo "✅ Updated operator-ui to $(VERSION)"

##@ Helm Charts

.PHONY: helm-package
helm-package: ## Package Helm chart
	@echo "📦 Packaging Helm chart..."
	@CHART_VERSION=$$(grep '^version:' helm/Chart.yaml | awk '{print $$2}' | tr -d '"' | tr -d "'"); \
	helm package helm/
	@echo "✅ Helm chart packaged"

.PHONY: build-charts-site
build-charts-site: helm-package ## Create charts directory for GitHub Pages
	@CHART_VERSION=$$(grep '^version:' helm/Chart.yaml | awk '{print $$2}' | tr -d '"' | tr -d "'"); \
	CHART_FILE="operator-ui-$$CHART_VERSION.tgz"; \
	CHARTS_DIR="charts-site"; \
	echo "📦 Preparing charts site..."; \
	mkdir -p "$$CHARTS_DIR"
	@echo "📥 Fetching existing charts from GitHub Pages..."
	@if curl -fsSL https://forkspacer.github.io/operator-ui/index.yaml -o /tmp/current-index.yaml 2>/dev/null; then \
		echo "✅ Found existing Helm repository"; \
	else \
		echo "ℹ️  No existing charts found (first deployment)"; \
	fi
	@CHART_VERSION=$$(grep '^version:' helm/Chart.yaml | awk '{print $$2}' | tr -d '"' | tr -d "'"); \
	CHART_FILE="operator-ui-$$CHART_VERSION.tgz"; \
	CHARTS_DIR="charts-site"; \
	if [ -f /tmp/current-index.yaml ]; then \
		grep -oP 'https://forkspacer\.github\.io/operator-ui/operator-ui-[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?\.tgz' /tmp/current-index.yaml | sort -u | while read url; do \
			filename=$$(basename "$$url"); \
			if [ "$$filename" = "$$CHART_FILE" ]; then \
				echo "  ⏭️  Skipping $$filename (will be replaced)"; \
				continue; \
			fi; \
			echo "  📥 Downloading $$filename..."; \
			if curl -fsSL "$$url" -o "$$CHARTS_DIR/$$filename"; then \
				echo "  ✅ Downloaded $$filename"; \
			else \
				echo "  ⚠️  Failed to download $$filename"; \
			fi; \
		done; \
	fi
	@CHART_VERSION=$$(grep '^version:' helm/Chart.yaml | awk '{print $$2}' | tr -d '"' | tr -d "'"); \
	CHART_FILE="operator-ui-$$CHART_VERSION.tgz"; \
	CHARTS_DIR="charts-site"; \
	echo "✅ Downloaded $$(ls $$CHARTS_DIR/operator-ui-*.tgz 2>/dev/null | wc -l) existing chart(s)"; \
	cp "$$CHART_FILE" "$$CHARTS_DIR/"; \
	echo "✅ Added new chart: $$CHART_FILE"
	@CHARTS_DIR="charts-site"; \
	echo "📄 Generating Helm repo index..."; \
	helm repo index "$$CHARTS_DIR" --url https://forkspacer.github.io/operator-ui
	@CHARTS_DIR="charts-site"; \
	if [ -f ".github/templates/helm-page.html" ]; then \
		cp .github/templates/helm-page.html "$$CHARTS_DIR/index.html"; \
	else \
		echo "⚠️  Warning: .github/templates/helm-page.html not found, skipping HTML generation"; \
	fi
	@CHART_VERSION=$$(grep '^version:' helm/Chart.yaml | awk '{print $$2}' | tr -d '"' | tr -d "'"); \
	APP_VERSION=$$(grep '^appVersion:' helm/Chart.yaml | awk '{print $$2}' | tr -d '"' | tr -d "'"); \
	CHARTS_DIR="charts-site"; \
	if [ -f "$$CHARTS_DIR/index.html" ]; then \
		sed -i "s/{{VERSION_TAG}}/$$APP_VERSION/g" "$$CHARTS_DIR/index.html"; \
		sed -i "s/{{VERSION_NUMBER}}/$$CHART_VERSION/g" "$$CHARTS_DIR/index.html"; \
		echo "✅ Generated index.html from template"; \
	fi
	@CHARTS_DIR="charts-site"; \
	echo "✅ Charts site ready with $$(ls $$CHARTS_DIR/operator-ui-*.tgz 2>/dev/null | wc -l) chart version(s)"; \
	echo ""; \
	echo "📦 Available versions:"; \
	ls -lh $$CHARTS_DIR/operator-ui-*.tgz 2>/dev/null || echo "No charts found"
