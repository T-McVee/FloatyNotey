<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## OpenSpec + Beads Integration Workflow

This project uses **OpenSpec** for spec-driven planning and **Beads** for task tracking. These tools MUST be kept in sync throughout the development lifecycle.

### Workflow

1. **Create & approve an OpenSpec proposal** — Follow `openspec/AGENTS.md` to create a change proposal (`proposal.md`, `tasks.md`, spec deltas). Do not proceed until the proposal is reviewed and approved.

2. **Create beads for each task** — Once a proposal is approved, create a bead for every task in `tasks.md`:
   ```bash
   bd create "Implement database schema for two-factor auth" \
     --label "openspec:add-two-factor-auth" \
     --label "task:1.1"
   ```
   Each bead MUST include:
   - A reference to the OpenSpec change ID (e.g., `add-two-factor-auth`)
   - The specific task number from `tasks.md` it relates to (e.g., `1.1`)
   - Enough context and acceptance criteria for a developer (or AI agent) to carry out the work independently
   - Dependencies on other beads, mapped with `bd update <id> --blocked-by <dep-id>`

3. **Work on tasks** — Pick up beads in dependency order. Mark the bead as in-progress when starting:
   ```bash
   bd update <issue-id> --status in_progress
   ```

4. **Complete tasks — update both tools** — When a task is finished, update **both** the bead and the OpenSpec task:
   ```bash
   # Mark the bead as done
   bd update <issue-id> --status done

   # Check off the corresponding task in tasks.md (edit the checkbox to [x])
   ```
   Do NOT mark one without the other. Both must stay in sync.

5. **Archive the proposal** — Once all tasks and beads are complete, archive the OpenSpec change:
   ```bash
   openspec archive <change-id> --yes
   ```

### Rules

- Never start implementation before the proposal is approved
- Every `tasks.md` item must have a corresponding bead
- Beads must reference their OpenSpec change ID and task number
- Bead descriptions must be self-contained — include enough context for independent execution
- When a task is done, mark both the bead (`bd update --status done`) and the `tasks.md` checkbox (`[x]`)
- When all tasks are complete, archive the OpenSpec change

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
