# Contributing

Contributions of any kind are welcome - bug reports, patches, documentation fixes, or translations. This document covers how to get set up and what to expect.

---

## Table of Contents

- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Development Setup](#development-setup)
- [Pull Requests](#pull-requests)
- [Project Structure](#project-structure)
- [Getting Help](#getting-help)

---

## Reporting Bugs

Before opening an issue, search the existing ones - it may already be reported or fixed. If not, include the following:

```
**What happened**
Describe the bug clearly and what you were doing when it occurred.

**Steps to reproduce**
1. ...
2. ...
3. ...

**Expected behaviour**
What should have happened instead.

**Environment**
- OS:
- Java version:
- Browser (if relevant):
- Application version:

**Additional context**
Logs, screenshots, anything else that might help.
```

The more specific, the faster it gets fixed.

---

## Suggesting Features

Feature requests are fine, but keep in mind this is a scout management tool - suggestions should fit that scope. Open an issue and describe:

- The problem you're running into
- What you'd like to see instead
- Whether you've considered other approaches
- How it would benefit scout organisations

---

## Development Setup

### Prerequisites

- Java 17+
- Maven 3.6+
- Git
- An IDE (IntelliJ IDEA works well)
- Google Chrome (only needed for WhatsApp integration)

### Getting started

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/abanoubwagim/scout-management-system.git
cd scout-management-system
git remote add upstream https://github.com/abanoubwagim/scout-management-system.git
git checkout -b your-branch-name
```

```bash
# Build
mvn clean install

# Run
mvn spring-boot:run
# or
java -jar target/scout-management-system-1.0.0.jar
```

The app runs at `http://localhost:9090/signIn.html`.

The SQLite database is created automatically under `database/scout_system.db` on first run.

For WhatsApp integration: make sure ChromeDriver is on your PATH. Session data is stored in `C:/whatsapp-session/`.

---

## Pull Requests

Sync with upstream before starting any work:

```bash
git fetch upstream
git rebase upstream/main
```

When your changes are ready, push your branch and open a pull request. In the description, explain what changed and why, and reference any related issues (`Fixes #123`). Include screenshots if it's a UI change.

Reviews take time — please be patient, and respond to feedback when it comes in.

### Commit messages

```
<type>(<scope>): <short description>

Optional longer explanation.

Refs #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

Examples:

```
feat(attendance): add QR code scanning
fix(member): resolve duplicate code validation
docs(readme): update installation steps
```

## Project Structure

```
src/main/java/com/scout_system/
├── controller/     # HTTP endpoints
├── service/        # Business logic
├── repository/     # Database access
├── model/          # Entity classes
└── config/         # App configuration
```

## Issue Labels

| Label              | Meaning                          |
|--------------------|----------------------------------|
| `bug`              | Something isn't working          |
| `enhancement`      | Feature request                  |
| `documentation`    | Docs change                      |
| `good first issue` | Good for first-time contributors |
| `help wanted`      | Needs attention                  |
| `duplicate`        | Already reported                 |
| `wontfix`          | Out of scope                     |

---

## Getting Help

- [GitHub Discussions](https://github.com/abanoubwagim/scout-management-system/discussions)
- [GitHub Issues](https://github.com/abanoubwagim/scout-management-system/issues)
- Email: abanoubwagim@gmail.com
