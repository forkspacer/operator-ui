# Contributing to Forkspacer Operator UI

Thank you for your interest in contributing to Forkspacer Operator UI! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

---

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Git
- Docker (for building images)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork locally:**

```bash
git clone https://github.com/YOUR_USERNAME/operator-ui.git
cd operator-ui
```

3. **Add upstream remote:**

```bash
git remote add upstream https://github.com/forkspacer/operator-ui.git
```

4. **Install dependencies:**

```bash
npm install
```

5. **Start the development server:**

```bash
npm start
```

The app will run at `http://localhost:3000` with hot-reloading.

---

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/my-new-feature
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `chore/` - Maintenance tasks
- `refactor/` - Code refactoring

### 2. Make Your Changes

- Write clean, maintainable code
- Follow existing code patterns and style
- Add tests for new features
- Update documentation as needed

### 3. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add module catalog search"
```

**Commit message format:**

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no code change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Examples:**

```bash
git commit -m "feat: add module deployment wizard"
git commit -m "fix: resolve dashboard loading issue"
git commit -m "docs: update README with new examples"
git commit -m "test: add unit tests for module form"
```

### 4. Keep Your Branch Updated

Regularly sync with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

### 5. Push to Your Fork

```bash
git push origin feature/my-new-feature
```

---

## Submitting Changes

### Opening a Pull Request

1. **Push your branch** to your fork
2. **Open a Pull Request** on GitHub
3. **Fill out the PR template** with:
   - Description of changes
   - Related issue numbers (if applicable)
   - Testing performed
   - Screenshots (for UI changes)

### PR Requirements

Before submitting, ensure:

- ✅ All tests pass: `npm test -- --watchAll=false`
- ✅ Build succeeds: `npm run build`
- ✅ No linting errors
- ✅ Code is well-documented
- ✅ Commits follow conventional commit format

### CLA Signing

All contributors must sign the Contributor License Agreement (CLA):

1. The CLA bot will comment on your PR
2. Read the [CLA document](CLA.md)
3. Comment on your PR: `I have read the CLA Document and I hereby sign the CLA`
4. The CLA status check will update automatically

### Review Process

1. **Automated Checks:** CI workflows will run automatically
   - Linting
   - Unit tests
   - Build verification
   - Docker build test

2. **Code Review:** Maintainers will review your PR
   - Address feedback and requested changes
   - Push updates to your branch (PR updates automatically)

3. **Approval & Merge:** Once approved, maintainers will merge your PR

---

## Coding Standards

### TypeScript

- Use TypeScript for type safety
- Avoid `any` types when possible
- Define interfaces for props and state

```typescript
// Good
interface ModuleCardProps {
  name: string;
  version: string;
  onDeploy: () => void;
}

// Avoid
function ModuleCard(props: any) { ... }
```

### React Components

- Use functional components with hooks
- Keep components small and focused (single responsibility)
- Extract reusable logic into custom hooks

```typescript
// Good
const ModuleCard: React.FC<ModuleCardProps> = ({ name, version, onDeploy }) => {
  return (
    <div className="module-card">
      <h3>{name}</h3>
      <p>{version}</p>
      <button onClick={onDeploy}>Deploy</button>
    </div>
  );
};
```

### File Organization

```
src/
├── components/       # Reusable UI components
├── pages/           # Page-level components
├── hooks/           # Custom React hooks
├── services/        # API calls and business logic
├── types/           # TypeScript types/interfaces
├── utils/           # Utility functions
└── styles/          # Global styles
```

### Styling

- Use CSS modules or styled-components
- Follow existing styling patterns
- Ensure responsive design

### Naming Conventions

- **Components:** PascalCase (`ModuleCard.tsx`)
- **Files:** camelCase or kebab-case
- **Variables/Functions:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **CSS Classes:** kebab-case

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm test -- --watchAll=false

# Run with coverage
npm test -- --coverage --watchAll=false
```

### Writing Tests

- Write tests for new features and bug fixes
- Use React Testing Library
- Test user interactions, not implementation details

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import ModuleCard from './ModuleCard';

test('calls onDeploy when deploy button is clicked', () => {
  const handleDeploy = jest.fn();
  render(<ModuleCard name="Redis" version="1.0.0" onDeploy={handleDeploy} />);

  const deployButton = screen.getByText('Deploy');
  fireEvent.click(deployButton);

  expect(handleDeploy).toHaveBeenCalledTimes(1);
});
```

### Test Coverage

- Aim for >80% code coverage
- Focus on critical paths and edge cases
- Don't sacrifice quality for coverage numbers

---

## Documentation

### Code Comments

- Document complex logic and algorithms
- Explain **why**, not **what** (code should be self-explanatory)
- Use JSDoc for public APIs

```typescript
/**
 * Deploys a module to the specified workspace
 * @param moduleId - The unique identifier of the module
 * @param workspaceId - The target workspace ID
 * @returns Promise resolving to deployment status
 */
async function deployModule(moduleId: string, workspaceId: string): Promise<DeploymentStatus> {
  // Implementation
}
```

### README Updates

Update README.md when:
- Adding new features
- Changing installation/setup process
- Updating configuration options

### Changelog

Maintainers will update CHANGELOG.md based on PR descriptions.

---

## Community

### Getting Help

- **GitHub Issues:** Report bugs or request features
- **GitHub Discussions:** Ask questions and share ideas
- **Documentation:** Check the [README](README.md) first

### Reporting Bugs

When reporting bugs, include:

1. **Description:** Clear description of the issue
2. **Steps to Reproduce:** Numbered steps to reproduce the bug
3. **Expected Behavior:** What should happen
4. **Actual Behavior:** What actually happens
5. **Environment:**
   - Node.js version
   - Browser and version
   - Operating system
6. **Screenshots:** If applicable

### Feature Requests

When requesting features:

1. **Use Case:** Describe the problem you're trying to solve
2. **Proposed Solution:** Your idea for solving it
3. **Alternatives:** Other solutions you've considered
4. **Additional Context:** Any other relevant information

---

## Release Process

Releases are managed by maintainers:

1. **Version Bump:** Update version in `package.json`
2. **Create Tag:** `git tag v0.1.0`
3. **Push Tag:** `git push origin v0.1.0`
4. **Automated Release:** CI builds and publishes Docker images

Contributors don't need to handle releases.

---

## Questions?

If you have questions not covered here, feel free to:
- Open a [GitHub Discussion](https://github.com/forkspacer/operator-ui/discussions)
- Ask in your Pull Request
- Check existing issues for similar questions

---

**Thank you for contributing to Forkspacer Operator UI!** 🎉
