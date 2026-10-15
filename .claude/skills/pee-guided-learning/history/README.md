# History — the owner-delivered draft (v1)

This directory holds the draft skill exactly as the owner delivered it on 2026-10-15, in
`PEE-GUIDED-LEARNING-CLAUDE-SKILL-DRAFT-v1.zip`.

- **The draft files.** `draft-v1-SKILL.md` is the zip's `SKILL.md`. `draft-v1-README-INSTALL.md` is its
  `README-INSTALL.md`. Both are renamed copies; their bytes are unchanged.
- **Why the draft is renamed.** It is not loaded as a skill: only the top-level `../SKILL.md` is.
- **Where the reference files went.** The zip's four reference files are preserved unchanged in `../references/`.
- **How to verify nothing was altered.** `SOURCE-MANIFEST.sha256` lists the hashes. From the skill directory, run:
  `grep -v '^#' history/SOURCE-MANIFEST.sha256 | sha256sum -c`.
- **What changed between the draft and the installed skill, and why.** See
  `../references/decisions-and-supersessions.md`, rows S5, S10 and S11.

Do not edit these files. Record corrections in the supersession log instead.
