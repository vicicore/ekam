# Push the completed SETU repository to GitHub

This package is already structured as the final repository root.

## Option A — easiest from VS Code terminal

1. Extract the ZIP.
2. Open the extracted `setu-final` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

```bash
git init
git branch -M main
git remote add origin https://github.com/vicicore/setu.git
git add .
git commit -m "feat: merge SETU phases 1-30"
git push -u origin main
```

If Git says `remote origin already exists`, run:

```bash
git remote set-url origin https://github.com/vicicore/setu.git
```

Then repeat the `git add`, `git commit`, and `git push` commands.

If GitHub asks for authentication, use your GitHub account/browser credential flow or a GitHub Personal Access Token when Git requests a password. Do not put the token into any source file.

## Option B — replace the existing repository contents

If your local checkout already points to `vicicore/setu`, copy the contents of this package over the checkout, keeping the `.git` directory, then run:

```bash
git add .
git commit -m "feat: complete SETU phases 1-30"
git push origin main
```

Do not commit `.env` files containing real secrets.
