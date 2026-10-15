# PEE Guided Learning — installation and handoff

This is a Claude Agent Skill package with the original PEE v9 cumulative research and the Claude-only feasibility audit included *unchanged* in `references/`.

## Claude.ai

Upload the **ZIP containing the `pee-guided-learning/` directory** using the Skills interface (currently `Customize > Skills > Create skill > Upload a skill`, when supported for your account). You may use a normal Claude chat to edit/refine the skill before installing it. Uploading a ZIP to a chat as an attachment **does not, by itself, install the Skill**.

## Claude Code

Project-scoped install: copy the `pee-guided-learning/` folder to the Git repository's `.claude/skills/pee-guided-learning/` at its **repository root**; the required file is `.claude/skills/pee-guided-learning/SKILL.md`. Do not confuse the repository root with `engine/product-evidence-engine-v5.67-phase243/`.

Personal install: `~/.claude/skills/pee-guided-learning/` if you want it outside the repository.

As of 2026-10, recent Claude Code versions can also sync certain enabled Claude.ai skills on supported account sign-in; confirm actual version/account and availability rather than relying on automatic synchronization. No use of a second model or API is necessary for this skill.

## Recommended timing and safety

Draft skill can be installed now without changing PEE code, but **do not launch major implementation from this skill alone while Phase249 is unfinished**. After Phase249 completes, give Claude a specific phase prompt grounded in the latest technical report and ask it to review/revise this skill accordingly. The skill is reusable process knowledge, not a substitute for current technical state.

Review its contents before enabling it. No scripts or API calls are bundled; the package is Markdown instructions and references only.

## Official format references (checked 2026-10)

- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- https://support.claude.com/en/articles/12512198-how-to-create-custom-skills
- https://support.claude.com/en/articles/12512180-use-skills-in-claude
