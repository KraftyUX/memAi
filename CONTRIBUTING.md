# Contributing to memAI

Thank you for your interest in contributing to memAI. This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. By participating in this project, you agree to:

- Be respectful and considerate in all interactions
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what is best for the community and project
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Git
- Basic understanding of JavaScript/Node.js
- Familiarity with SQLite (helpful but not required)

### Development Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/kraftyux/memai.git
   cd memai
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/kraftyux/memai.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Initialize the database**:
   ```bash
   npm run init
   ```

6. **Test the CLI**:
   ```bash
   npm run cli -- stats
   ```

7. **Launch the dashboard**:
   ```bash
   npm run dashboard
   ```

## Development Workflow

### Branching Strategy

- `main` - Stable, production-ready code
- `develop` - Integration branch for features (if used)
- Feature branches - Named descriptively: `feat/description`, `fix/description`, `docs/description`

### Creating a Feature Branch

```bash
git checkout main
git pull upstream main
git checkout -b feat/your-feature-name
```

### Making Changes

1. Make your changes in your feature branch
2. Follow the coding standards (see below)
3. Test your changes thoroughly
4. Commit with clear, descriptive messages

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

**Examples**:
```
feat(api): add method to export memories as JSON
fix(dashboard): resolve pagination issue on mobile
docs(readme): update installation instructions
refactor(core): simplify memory recording logic
```

### Submitting Changes

1. **Push to your fork**:
   ```bash
   git push origin feat/your-feature-name
   ```

2. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Reference any related issues
   - Provide a detailed description of changes
   - Include screenshots for UI changes
   - Fill out the PR template completely

3. **Respond to feedback**:
   - Address review comments promptly
   - Push additional commits to the same branch
   - Request re-review when ready

## Coding Standards

### JavaScript Style

- **ES Modules**: Use `import`/`export` syntax
- **Modern JavaScript**: Use ES6+ features (arrow functions, destructuring, etc.)
- **Consistent Formatting**: 2-space indentation, semicolons required
- **Naming Conventions**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes
  - `UPPER_SNAKE_CASE` for constants
- **File Organization**: One class per file, related functions grouped

### Code Quality

- **Modularity**: Keep functions small and focused (< 50 lines)
- **Single Responsibility**: Each function/class should do one thing well
- **Error Handling**: Always handle errors gracefully, never fail silently
- **Comments**: Explain *why*, not *what* - code should be self-documenting
- **No Magic Numbers**: Use named constants for hardcoded values
- **Immutability**: Prefer `const` over `let`, avoid mutating objects

### Database Guidelines

- **Schema Changes**: Document in migration files
- **Queries**: Use prepared statements to prevent SQL injection
- **Indexes**: Add indexes for frequently queried columns
- **Transactions**: Use transactions for multi-step operations

### API Design

- **Consistency**: Follow existing patterns in the codebase
- **Validation**: Validate all inputs
- **Return Values**: Return meaningful data or throw descriptive errors
- **Backwards Compatibility**: Avoid breaking changes when possible

## Testing Requirements

### Running Tests

```bash
npm test
```

### Test Coverage

- All new features must include tests
- Bug fixes should include regression tests
- Aim for high coverage of critical paths
- Test edge cases and error conditions

### Manual Testing

Before submitting a PR:

1. Test the CLI commands you modified
2. Test the dashboard if UI changes were made
3. Verify the database schema if schema changes were made
4. Test on Node.js 16, 18, and 20 if possible

## Documentation Requirements

### Code Documentation

- Add JSDoc comments for public APIs
- Document parameters, return values, and exceptions
- Include usage examples for complex functions

### User Documentation

When adding features, update:

- `README.md` - If it affects quick start or core concepts
- `docs/API.md` - For API changes
- `docs/CLI.md` - For CLI changes
- `docs/EXAMPLES.md` - Add practical examples
- `CHANGELOG.md` - Document the change

### Documentation Style

- Use clear, concise language
- Provide code examples
- Include expected output
- Add troubleshooting tips for common issues

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No merge conflicts with main
- [ ] Self-review completed

### PR Template

Fill out all sections of the PR template:

- **Description**: What does this PR do?
- **Related Issues**: Link to issues (e.g., "Fixes #123")
- **Type of Change**: Bug fix, feature, docs, etc.
- **Testing**: How was this tested?
- **Checklist**: Complete all items

### Review Process

1. **Automated Checks**: CI must pass (linting, tests)
2. **Code Review**: At least one maintainer approval required
3. **Testing**: Reviewers may test changes locally
4. **Feedback**: Address all comments or discuss concerns
5. **Merge**: Maintainer will merge when approved

### After Merge

- Delete your feature branch
- Pull the latest main branch
- Celebrate your contribution! 🎉

## Issue Guidelines

### Reporting Bugs

Use the bug report template and include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS)
- Error messages or logs
- Screenshots if applicable

### Requesting Features

Use the feature request template and include:

- Problem you're trying to solve
- Proposed solution
- Alternative solutions considered
- Additional context or examples

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested

## Community

### Getting Help

- **Documentation**: Check [docs/](docs/) first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers for sensitive issues

### Recognition

Contributors are recognized in:

- GitHub contributors page
- Release notes for significant contributions
- Special thanks in documentation

## License

By contributing to memAI, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to memAI!** Your efforts help make this project better for everyone.
