#!/usr/bin/env python3
"""
Post-edit code review hook for sane-router
Reviews changes for common issues and style violations
"""
import json
import subprocess
import sys
import re
from pathlib import Path


def get_file_changes(file_path: str, project_dir: str) -> str:
    """Get git diff for a file to see what changed"""
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", file_path],
            cwd=project_dir,
            capture_output=True,
            text=True,
            timeout=10,
        )
        return result.stdout
    except Exception:
        return ""


def review_typescript_file(file_path: str, content: str, diff: str) -> list[str]:
    """Review TypeScript file for common issues"""
    issues = []

    # Check for console.log (should use proper logging in production code)
    if re.search(r'\bconsole\.(log|debug)\b', content):
        # Allow console.warn and console.error
        if file_path.endswith('.test.ts'):
            pass  # Allow in tests
        else:
            issues.append("⚠️  Contains console.log/debug - consider using proper logging")

    # Check for 'any' type usage (except in test files)
    if not file_path.endswith('.test.ts'):
        any_matches = re.findall(r':\s*any\b', content)
        if any_matches and len(any_matches) > 2:
            issues.append(f"⚠️  Found {len(any_matches)} uses of 'any' type - consider using specific types")

    # Check for TODO/FIXME comments
    todos = re.findall(r'//.*(?:TODO|FIXME).*', content)
    if todos:
        issues.append(f"⚠️  Contains {len(todos)} TODO/FIXME comment(s) - consider addressing before commit")

    # Check for debugger statements
    if 'debugger;' in content:
        issues.append("❌ Contains debugger statement - must be removed")

    return issues


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)

    # Only run on Edit and Write tools for TypeScript files
    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    if tool_name not in ["Edit", "Write"]:
        sys.exit(0)

    file_path = tool_input.get("file_path", "")

    # Only review TypeScript files (excluding .d.ts files)
    if not file_path.endswith('.ts') or file_path.endswith('.d.ts'):
        sys.exit(0)

    # Read the file content
    try:
        with open(file_path, 'r') as f:
            content = f.read()
    except Exception as e:
        print(f"Warning: Could not read file for review: {e}", file=sys.stderr)
        sys.exit(0)

    # Get git diff if available
    project_dir = input_data.get("cwd", ".")
    diff = get_file_changes(file_path, project_dir)

    # Review the file
    issues = review_typescript_file(file_path, content, diff)

    if issues:
        print("\n" + "=" * 60, file=sys.stderr)
        print(f"📝 Code Review: {Path(file_path).name}", file=sys.stderr)
        print("=" * 60, file=sys.stderr)
        for issue in issues:
            print(issue, file=sys.stderr)
        print("=" * 60 + "\n", file=sys.stderr)

        # Check if any critical issues (❌)
        critical = any(issue.startswith("❌") for issue in issues)
        if critical:
            # Block with critical issues
            sys.exit(2)

    # Non-blocking warnings or success
    sys.exit(0)


if __name__ == "__main__":
    main()
