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
	@echo "📥 Fetching existing charts from GitHub Releases..."
	@REPO_OWNER="forkspacer"; \
	REPO_NAME="operator-ui"; \
	CHART_VERSION=$$(grep '^version:' helm/Chart.yaml | awk '{print $$2}' | tr -d '"' | tr -d "'"); \
	CHART_FILE="operator-ui-$$CHART_VERSION.tgz"; \
	CHARTS_DIR="charts-site"; \
	if curl -fsSL "https://api.github.com/repos/$$REPO_OWNER/$$REPO_NAME/releases" -o /tmp/releases.json 2>/dev/null; then \
		echo "✅ Found GitHub releases"; \
		if command -v jq >/dev/null 2>&1; then \
			echo "🔍 Using jq for JSON parsing..."; \
			cat /tmp/releases.json | jq -r '.[] | select(.assets[].name | test("operator-ui-.*\\.tgz")) | .assets[] | select(.name | test("operator-ui-.*\\.tgz")) | .browser_download_url' | sort -u | while read url; do \
				filename=$$(basename "$$url"); \
				if [ "$$filename" = "$$CHART_FILE" ]; then \
					echo "  ⏭️  Skipping $$filename (will be replaced)"; \
					continue; \
				fi; \
				echo "  📥 Downloading $$filename from GitHub Releases..."; \
				if curl -fsSL "$$url" -o "$$CHARTS_DIR/$$filename"; then \
					echo "  ✅ Downloaded $$filename"; \
				else \
					echo "  ⚠️  Failed to download $$filename"; \
				fi; \
			done; \
		else \
			echo "⚠️ jq not available, using manual parsing..."; \
			grep -o '"browser_download_url": "[^"]*operator-ui-[^"]*\.tgz"' /tmp/releases.json | cut -d'"' -f4 | sort -u | while read url; do \
				filename=$$(basename "$$url"); \
				if [ "$$filename" != "$$CHART_FILE" ]; then \
					echo "  📥 Downloading $$filename from GitHub Releases..."; \
					if curl -fsSL "$$url" -o "$$CHARTS_DIR/$$filename"; then \
						echo "  ✅ Downloaded $$filename"; \
					else \
						echo "  ⚠️  Failed to download $$filename"; \
					fi; \
				fi; \
			done; \
		fi; \
		rm -f /tmp/releases.json; \
	else \
		echo "ℹ️  No GitHub releases found or API unavailable (first deployment)"; \
	fi
	@CHART_VERSION=$$(grep '^version:' helm/Chart.yaml | awk '{print $$2}' | tr -d '"' | tr -d "'"); \
	CHART_FILE="operator-ui-$$CHART_VERSION.tgz"; \
	CHARTS_DIR="charts-site"; \
	echo "✅ Downloaded $$(ls $$CHARTS_DIR/operator-ui-*.tgz 2>/dev/null | wc -l) existing chart(s)"; \
	cp "$$CHART_FILE" "$$CHARTS_DIR/"; \
	echo "✅ Added new chart: $$CHART_FILE"
	@CHARTS_DIR="charts-site"; \
	echo "📄 Generating Helm repo index with GitHub Releases URLs..."; \
	CHART_VERSION=$$(grep '^version:' helm/Chart.yaml | awk '{print $$2}' | tr -d '"' | tr -d "'"); \
	APP_VERSION=$$(grep '^appVersion:' helm/Chart.yaml | awk '{print $$2}' | tr -d '"' | tr -d "'"); \
	helm repo index "$$CHARTS_DIR" --url "https://github.com/forkspacer/operator-ui/releases/download"; \
	sed -i.bak "s|https://github.com/forkspacer/operator-ui/releases/download/operator-ui-\([0-9]\+\.[0-9]\+\.[0-9]\+\)\.tgz|https://github.com/forkspacer/operator-ui/releases/download/v\1/operator-ui-\1.tgz|g" "$$CHARTS_DIR/index.yaml"; \
	rm -f "$$CHARTS_DIR/index.yaml.bak"
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
