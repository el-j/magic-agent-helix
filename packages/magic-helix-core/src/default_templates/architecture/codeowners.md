# CODEOWNERS Guidelines

## Overview
This project uses CODEOWNERS file to define code ownership and automate review requests.

## File Location
- `.github/CODEOWNERS` (recommended)
- `CODEOWNERS` (root)
- `docs/CODEOWNERS`

## Syntax
```
# Comments start with #
# Each line: pattern followed by owners

# Default owners for everything
* @org/default-team

# Specific directories
/docs/ @org/docs-team @user1
/src/api/ @org/backend-team
/src/ui/ @org/frontend-team

# Specific files
package.json @org/platform-team
Dockerfile @org/devops-team

# Wildcards
*.md @org/docs-team
**/*.test.ts @org/qa-team

# Multiple owners
/src/auth/ @org/security-team @org/backend-team
```

## Pattern Matching
- `*`: Matches any files
- `**`: Matches directories recursively
- `?`: Matches single character
- `[abc]`: Matches a, b, or c
- Last matching pattern takes precedence

## Owner Types
- Individual users: `@username`
- Teams: `@org/team-name`
- Email addresses: `user@example.com`

## Best Practices
- Define default owners at the top
- Be specific with critical paths
- Assign multiple owners for coverage
- Keep teams small and focused
- Document ownership rationale
- Review and update regularly

## Review Requirements
- Owners are automatically requested for reviews
- Can require approval from code owners (branch protection)
- Blocks merge without owner approval

## Responsibilities
- Code owners should:
  - Review PRs affecting their code
  - Maintain code quality
  - Update documentation
  - Mentor contributors
  - Keep ownership updated

## Common Patterns
```
# Backend API
/src/api/**/*.ts @org/backend-team

# Frontend Components
/src/components/**/*.tsx @org/frontend-team

# Infrastructure
/infrastructure/ @org/devops-team
/.github/workflows/ @org/devops-team

# Documentation
/docs/ @org/docs-team
*.md @org/docs-team

# Configuration
*.config.js @org/platform-team
package.json @org/platform-team

# Database
/migrations/ @org/backend-team @org/dba-team

# Security
/src/auth/ @org/security-team
```

## Branch Protection
- Enable "Require review from Code Owners"
- Set minimum number of approvals
- Dismiss stale reviews on push

## Notifications
- Owners receive review requests
- Configure notification preferences
- Use team mentions for broader awareness

## Troubleshooting
- Validate CODEOWNERS syntax
- Check team membership
- Verify file patterns match
- Test with specific files

## Integration
- Works with pull requests
- Integrates with branch protection
- Appears in PR sidebar
- Can be queried via API

## Maintenance
- Review quarterly
- Update for new teams/members
- Remove inactive owners
- Refactor for restructuring
- Document in team wiki
