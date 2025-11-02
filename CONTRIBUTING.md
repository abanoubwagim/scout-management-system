# Contributing to Scout Management System

First off, thank you for considering contributing to Scout Management System! 🎉 It's people like you that make this system better for scout organizations worldwide.

## 🌟 How Can I Contribute?

There are many ways to contribute to this project:

- 🐛 **Report bugs**
- 💡 **Suggest new features**
- 📝 **Improve documentation**
- 🔧 **Submit code changes**
- 🌍 **Translate to other languages**
- 🎨 **Improve UI/UX**
- ✅ **Write tests**

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Report Bugs](#how-to-report-bugs)
- [How to Suggest Features](#how-to-suggest-features)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Project Structure](#project-structure)
- [Testing Guidelines](#testing-guidelines)
- [Community](#community)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our commitment to:

- **Be respectful** - Treat everyone with respect and kindness
- **Be inclusive** - Welcome and support people of all backgrounds
- **Be collaborative** - Work together and help each other
- **Be patient** - Remember we're all volunteers
- **Be constructive** - Provide helpful feedback

By participating, you are expected to uphold these values.

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Java 17** or higher installed
- **Maven 3.6+** for building
- **Git** for version control
- **IDE** (IntelliJ IDEA, Eclipse, or VS Code recommended)
- **Google Chrome** (for WhatsApp integration testing)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
```bash
git clone https://github.com/YOUR_USERNAME/scout-management-system.git
cd scout-management-system
```

3. **Add upstream remote**:
```bash
git remote add upstream https://github.com/abanoubwagim/scout-management-system.git
```

4. **Create a branch** for your work:
```bash
git checkout -b feature/your-feature-name
```

---

## 🐛 How to Report Bugs

### Before Submitting a Bug Report

- **Search existing issues** to avoid duplicates
- **Check the documentation** - your issue might be covered
- **Try the latest version** - the bug might be fixed
- **Isolate the problem** - provide minimal reproduction steps

### Submitting a Good Bug Report

Create an issue with the following information:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Enter '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11, Ubuntu 22.04]
- Java Version: [e.g., Java 17]
- Browser: [e.g., Chrome 120]
- Application Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information.
```

---

## 💡 How to Suggest Features

We love feature suggestions! Here's how to suggest one:

### Before Suggesting

- **Search existing feature requests** to avoid duplicates
- **Check the roadmap** - it might be planned
- **Consider if it fits the project scope**

### Submitting a Feature Request

Create an issue with:

**Feature Request Template:**

```markdown
**Is your feature request related to a problem?**
A clear description of the problem. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Use case**
Explain how this would benefit scout organizations.

**Additional context**
Add any other context or screenshots about the feature request.
```

---

## 💻 Development Setup

### 1. Build the Project

```bash
mvn clean install
```

### 2. Run the Application

```bash
mvn spring-boot:run
```

Or run directly:
```bash
java -jar target/scout-management-system-1.0.0.jar
```

### 3. Access the Application

Open your browser:
```
http://localhost:9090/signIn.html
```

### 4. Database Setup

The SQLite database is created automatically at:
```
database/scout_system.db
```

### 5. WhatsApp Setup (Optional)

For WhatsApp integration testing:
- Ensure ChromeDriver is in your PATH
- Session data will be stored in `C:/whatsapp-session/`

---

## 🔄 Pull Request Process

### Before You Submit

1. **Update your branch** with the latest changes:
```bash
git fetch upstream
git rebase upstream/main
```

2. **Test your changes** thoroughly
3. **Update documentation** if needed
4. **Follow coding standards** (see below)
5. **Write clear commit messages**

### Commit Message Guidelines

Follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(attendance): add QR code scanning feature

fix(member): resolve duplicate code validation issue

docs(readme): update installation instructions
```

### Submit Your Pull Request

1. **Push your branch**:
```bash
git push origin feature/your-feature-name
```

2. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Description of what changed and why
   - Reference to related issues (e.g., "Fixes #123")
   - Screenshots if UI changes

3. **Wait for review**:
   - Be patient - reviews take time
   - Respond to feedback promptly
   - Make requested changes if needed

4. **After approval**:
   - Your PR will be merged
   - You can delete your branch

---

## 📐 Coding Standards

### Java Code Style

- **Indentation**: 4 spaces (no tabs)
- **Line length**: Maximum 120 characters
- **Naming conventions**:
  - Classes: `PascalCase` (e.g., `MemberService`)
  - Methods: `camelCase` (e.g., `getMemberByCode`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_MEMBERS`)
  - Variables: `camelCase` (e.g., `memberCode`)

### Best Practices

```java
// ✅ Good
public class MemberService {
    private static final int MAX_CODE_LENGTH = 6;
    
    public Member findMemberByCode(String code) {
        // Clear, descriptive method name
        if (code == null || code.length() != MAX_CODE_LENGTH) {
            throw new IllegalArgumentException("Invalid code");
        }
        return memberRepository.findByCode(code)
            .orElseThrow(() -> new MemberNotFoundException(code));
    }
}

// ❌ Bad
public class ms {
    public Member get(String c) {
        return repo.find(c);
    }
}
```

### REST API Guidelines

- Use meaningful HTTP methods (GET, POST, PUT, DELETE)
- Return appropriate HTTP status codes
- Use consistent URL patterns
- Provide clear error messages

### Database Guidelines

- Use JPA annotations properly
- Follow naming conventions for tables and columns
- Add indexes for frequently queried fields
- Document complex queries

### Frontend Guidelines

- Use Bootstrap classes consistently
- Keep JavaScript modular
- Add comments for complex logic
- Ensure responsive design
- Test on multiple browsers

---

## 📁 Project Structure

Understanding the codebase:

```
src/main/java/com/scout_system/
├── controller/          # REST API endpoints
│   ├── MemberController.java
│   ├── AttendanceController.java
│   └── ...
├── service/            # Business logic
│   ├── MemberService.java
│   ├── AttendanceService.java
│   └── ...
├── repository/         # Database access
│   ├── MemberRepository.java
│   └── ...
├── model/             # Entity classes
│   ├── Member.java
│   └── ...
└── config/            # Configuration
    └── SecurityConfig.java
```

### Key Files to Know

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and validations
- **Repositories**: Interface with the database
- **Models**: Define data structures
- **application.properties**: Application configuration

---

## 🧪 Testing Guidelines

### Writing Tests

```java
@SpringBootTest
class MemberServiceTest {
    
    @Autowired
    private MemberService memberService;
    
    @Test
    void testAddMember_Success() {
        // Arrange
        Member member = new Member();
        member.setCode("251201");
        member.setFullName("Test Member");
        
        // Act
        Member saved = memberService.addMember(member);
        
        // Assert
        assertNotNull(saved.getId());
        assertEquals("251201", saved.getCode());
    }
    
    @Test
    void testAddMember_DuplicateCode_ThrowsException() {
        // Test error cases
        assertThrows(DuplicateCodeException.class, () -> {
            // Add duplicate member
        });
    }
}
```

### Running Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=MemberServiceTest

# Run with coverage
mvn test jacoco:report
```

---

## 🎯 Areas That Need Help

Current priority areas for contributions:

### High Priority
- 🔒 Enhanced security features
- 📱 Mobile app development
- 🌍 Multi-language support
- 📊 Advanced reporting features
- ✅ Unit and integration tests

### Medium Priority
- 🎨 UI/UX improvements
- 📧 Email integration
- 📅 Calendar integration
- 🔔 Push notifications

### Documentation
- 📝 API documentation
- 🎥 Video tutorials
- 📚 User guides
- 🌐 Translation of docs

---

## 🏷️ Issue Labels

We use labels to organize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested
- `wontfix` - This will not be worked on
- `duplicate` - This issue already exists

---

## 💬 Community

### Getting Help

- 💬 **Discussions**: [GitHub Discussions](https://github.com/abanoubwagim/scout-management-system/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/abanoubwagim/scout-management-system/issues)
- 📧 **Email**: abanoubwagim@gmail.com

### Stay Updated

- ⭐ Star the repository to stay updated
- 👀 Watch the repository for notifications
- 📢 Follow discussions

---

## 🙏 Recognition

Contributors are recognized in:

- **README.md** - Contributors section
- **Release notes** - For significant contributions
- **GitHub contributors** - Automatic recognition

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## ❓ Questions?

Don't hesitate to ask questions! You can:

- Open a discussion on GitHub
- Comment on an issue
- Send an email

**Remember**: There are no stupid questions. We're all here to learn and help each other! 🤝

---

<div align="center">

### 🎯 Thank you for contributing to Scout Management System!

**Together, we're building tools that help scouts worldwide.** 🌍

*Made with ❤️ by Abanoub Wagim*

</div>
