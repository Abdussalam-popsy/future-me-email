# Install Everything Claude Code (ECC) — Step-by-step

## Prerequisites ✓
- Claude Code CLI **2.1.0+** — You have **2.1.71**

---

## Step 1: Install the plugin (run inside Claude Code)

These commands run **inside** the Claude Code app/CLI, not in your normal terminal.

1. Open **Claude Code** (run `claude` in terminal, or open the app).
2. In the Claude Code chat/input, run these **two commands one after the other**:

```
/plugin marketplace add affaan-m/everything-claude-code
```

Then:

```
/plugin install everything-claude-code@everything-claude-code
```

3. Confirm the plugin is installed:

```
/plugin list everything-claude-code@everything-claude-code
```

You should see agents, commands, and skills listed.

---

## Step 2: Install rules (run in your normal terminal) ✓

Rules are not shipped by the plugin; install them manually so ECC’s guidelines apply.

**Already done for you** from this project directory:

```bash
# 1. Clone the repo (into your project)
cd /Users/abdussalam/Downloads/future-me/future-me-email
git clone https://github.com/affaan-m/everything-claude-code.git

# 2. Install common + TypeScript rules to ~/.claude/rules/
cd everything-claude-code
./install.sh typescript
```

Result: rules are in `~/.claude/rules/common/` and `~/.claude/rules/typescript/`.

---

## Step 3: Try it

In Claude Code, try for example:

- `/plan "Add a new feature"`
- `/code-review`
- `/tdd`

Use `/plugin list everything-claude-code@everything-claude-code` anytime to see available commands.
