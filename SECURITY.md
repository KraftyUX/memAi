# Security Policy

## Supported Versions

We actively support the following versions of memAI with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of memAI seriously. If you discover a security vulnerability, please follow these guidelines:

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security issues via one of these methods:

1. **Email**: Send details to [kraftyux@gmail.com](mailto:kraftyux@gmail.com)
   - Use subject line: "SECURITY: [Brief Description]"
   - Include detailed information (see below)

2. **GitHub Security Advisory**: Use GitHub's private vulnerability reporting
   - Go to the Security tab
   - Click "Report a vulnerability"
   - Fill out the advisory form

### What to Include

Please provide as much information as possible:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
- **Affected component** (e.g., API, CLI, dashboard, database)
- **Affected versions** (e.g., 1.0.0, all versions)
- **Steps to reproduce** the vulnerability
- **Proof of concept** code or exploit (if available)
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up questions

### Example Report

```
Subject: SECURITY: SQL Injection in search functionality

Type: SQL Injection
Component: API - searchByTag method
Versions: 1.0.0 and earlier
Severity: High

Description:
The searchByTag method does not properly sanitize user input,
allowing SQL injection through the tag parameter.

Steps to Reproduce:
1. Call memai.searchByTag("'; DROP TABLE memories; --")
2. Database table is dropped

Proof of Concept:
[Include code or screenshots]

Impact:
Attacker could read, modify, or delete database contents.

Suggested Fix:
Use parameterized queries instead of string concatenation.
```

## Response Timeline

We are committed to responding promptly to security reports:

- **Initial Response**: Within 48 hours of report
- **Status Update**: Within 7 days with assessment and timeline
- **Fix Development**: Depends on severity and complexity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days
- **Public Disclosure**: After fix is released and users have time to update

### Response Process

1. **Acknowledgment**: We confirm receipt of your report
2. **Assessment**: We evaluate severity and impact
3. **Development**: We develop and test a fix
4. **Notification**: We notify you when fix is ready
5. **Release**: We release patched version
6. **Disclosure**: We publish security advisory (with your credit, if desired)

## Security Disclosure Policy

### Coordinated Disclosure

We follow coordinated disclosure principles:

- We work with reporters to understand and fix issues
- We request reporters wait for fix before public disclosure
- We credit reporters in security advisories (unless they prefer anonymity)
- We aim for disclosure within 90 days of initial report

### Public Disclosure

After a fix is released:

1. **Security Advisory**: Published on GitHub Security Advisories
2. **Release Notes**: Included in CHANGELOG.md
3. **Notification**: Users notified via GitHub releases
4. **CVE**: Requested for significant vulnerabilities

## Security Best Practices

### For Users

When using memAI, follow these security practices:

#### Database Security

- **File Permissions**: Restrict access to `.memai.db` file
  ```bash
  chmod 600 .memai.db
  ```
- **Backup Encryption**: Encrypt database backups
- **Sensitive Data**: Avoid storing passwords or API keys in memories
- **Access Control**: Limit who can access the database file

#### API Security

- **Input Validation**: Validate all data before recording
- **Sanitization**: Sanitize user input to prevent injection
- **Error Handling**: Don't expose sensitive information in errors
- **Rate Limiting**: Implement rate limiting if exposing API publicly

#### Dashboard Security

- **Local Only**: Dashboard is designed for local use only
- **Network Exposure**: Do not expose dashboard to public internet
- **Authentication**: Add authentication if network access is needed
- **HTTPS**: Use HTTPS if accessing over network

#### Dependency Security

- **Regular Updates**: Keep memAI and dependencies updated
  ```bash
  npm update
  npm audit
  ```
- **Audit**: Run security audits regularly
  ```bash
  npm audit fix
  ```

### For Contributors

When contributing to memAI:

#### Code Security

- **Input Validation**: Always validate and sanitize inputs
- **SQL Injection**: Use parameterized queries, never string concatenation
- **XSS Prevention**: Escape output in dashboard HTML
- **Path Traversal**: Validate file paths before file operations
- **Dependency Review**: Review new dependencies for security issues

#### Review Checklist

Before submitting code:

- [ ] All user inputs are validated
- [ ] SQL queries use prepared statements
- [ ] No hardcoded secrets or credentials
- [ ] Error messages don't leak sensitive information
- [ ] File operations validate paths
- [ ] Dependencies are from trusted sources
- [ ] No known vulnerabilities in dependencies

## Known Security Considerations

### SQLite Database

- **Local Storage**: Database is stored locally as a file
- **No Authentication**: SQLite has no built-in authentication
- **File Access**: Anyone with file access can read the database
- **Mitigation**: Use OS-level file permissions and encryption

### Dashboard Server

- **HTTP Only**: Dashboard uses HTTP, not HTTPS
- **No Authentication**: No built-in authentication mechanism
- **Local Binding**: Binds to localhost by default
- **Mitigation**: Do not expose to public networks

### CLI Tool

- **Command Injection**: CLI parameters are passed to database
- **File System Access**: CLI can read/write database file
- **Mitigation**: Validate inputs, restrict file permissions

## Security Updates

### Notification Channels

Stay informed about security updates:

- **GitHub Releases**: Watch repository for releases
- **Security Advisories**: Enable GitHub security alerts
- **npm**: Use `npm outdated` to check for updates

### Update Process

When a security update is released:

1. **Review**: Read the security advisory and release notes
2. **Test**: Test the update in a non-production environment
3. **Backup**: Backup your database before updating
4. **Update**: Update to the patched version
   ```bash
   npm update memai
   ```
5. **Verify**: Verify the update was successful
   ```bash
   npm list memai
   ```

## Vulnerability Disclosure History

No security vulnerabilities have been reported or disclosed for memAI at this time.

Future disclosures will be listed here with:

- CVE identifier (if assigned)
- Affected versions
- Severity rating
- Brief description
- Fix version
- Credit to reporter

## Contact

For security-related questions or concerns:

- **Email**: [kraftyux@gmail.com](mailto:kraftyux@gmail.com)
- **Subject**: "SECURITY: [Your Question]"

For general questions, use GitHub Issues or Discussions.

---

**Thank you for helping keep memAI and its users safe!**
