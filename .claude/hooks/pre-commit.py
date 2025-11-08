#!/usr/bin/env python3
"""
Pre-commit validation hook for sane-router
Runs type checking, build, linting, and code review before allowing commits
"""
import json
import subprocess
import sys
from pathlib import Path


def run_command(cmd: str, cwd: str) -> tuple[bool, str, str]:
    """Run a command and return (success, stdout, stderr)"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=120,
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", f"Command timed out: {cmd}"
    except Exception as e:
        return False, "", f"Command failed: {e}"


def validate_commit(project_dir: str) -> tuple[bool, list[str]]:
    """
    Run all pre-commit validations
    Returns (success, list of error messages)
    """
    errors = []

    # 1. Type checking
    print("Running type check...", file=sys.stderr)
    success, stdout, stderr = run_command("bun run typecheck", project_dir)
    if not success:
        errors.append(f"❌ Type check failed:\n{stderr}")
    else:
        print("✓ Type check passed", file=sys.stderr)

    # 2. Build
    print("Running build...", file=sys.stderr)
    success, stdout, stderr = run_command("bun run build", project_dir)
    if not success:
        errors.append(f"❌ Build failed:\n{stderr}")
    else:
        print("✓ Build passed", file=sys.stderr)

    # 3. Linting
    print("Running lint...", file=sys.stderr)
    success, stdout, stderr = run_command("bun run lint", project_dir)
    if not success:
        errors.append(f"❌ Lint failed:\n{stderr}")
    else:
        print("✓ Lint passed", file=sys.stderr)

    # 4. Tests (ensure all tests still pass)
    print("Running tests...", file=sys.stderr)
    success, stdout, stderr = run_command("bun test", project_dir)
    if not success:
        errors.append(f"❌ Tests failed:\n{stderr}")
    else:
        print("✓ Tests passed", file=sys.stderr)

    return len(errors) == 0, errors


def main():
    try:
        # Read hook input from stdin
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)

    # Check if this is a git commit command
    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})
    command = tool_input.get("command", "")

    # Only validate actual git commits (not git add, git push, etc.)
    if tool_name != "Bash" or "git commit" not in command:
        sys.exit(0)

    # Skip validation for amend commits (these are typically hook fixes)
    if "--amend" in command:
        print("⏭️  Skipping validation for --amend commit", file=sys.stderr)
        sys.exit(0)

    # Get project directory
    project_dir = input_data.get("cwd", ".")

    print("=" * 60, file=sys.stderr)
    print("🔍 Running pre-commit validation...", file=sys.stderr)
    print("=" * 60, file=sys.stderr)

    # Run validations
    success, errors = validate_commit(project_dir)

    if not success:
        print("\n" + "=" * 60, file=sys.stderr)
        print("❌ Pre-commit validation FAILED", file=sys.stderr)
        print("=" * 60, file=sys.stderr)
        for error in errors:
            print(error, file=sys.stderr)
        print("\nPlease fix the errors above before committing.", file=sys.stderr)
        print("Tip: Run the failed command(s) manually to see full output.", file=sys.stderr)
        # Exit code 2 blocks the commit and shows stderr to Claude
        sys.exit(2)

    print("\n" + "=" * 60, file=sys.stderr)
    print("✅ All pre-commit checks passed!", file=sys.stderr)
    print("=" * 60, file=sys.stderr)
    # Exit code 0 allows the commit to proceed
    sys.exit(0)


if __name__ == "__main__":
    main()
