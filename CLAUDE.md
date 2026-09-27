# Consignes pour Claude — projet وِرد (Wird)

## Branches et déploiement

- **Une seule branche : `main`.** C'est la branche par défaut et la source de GitHub Pages.
- Travailler, committer et pousser **directement sur `main`** (`git push origin main`), même si la session a été lancée sur une autre branche (`claude/...`). Ne jamais créer ni pousser d'autre branche, ne jamais ouvrir de pull request, sauf demande explicite.
- Si la session démarre sur une branche `claude/...` : `git fetch origin main && git checkout main && git pull origin main` avant toute modification.

## Publier une version

1. Incrémenter `VERSION` dans `sw.js` (ex. `wird-v7`) **et** `APP_VERSION` dans `js/app.js` — sans cela l'app installée ne voit pas la mise à jour.
2. Committer et pousser sur `main`.
3. Vérifier que GitHub Pages a bien construit **ce** commit : le run « pages build and deployment » doit avoir pour `head_sha` le commit poussé. Un build déclenché juste après le push peut construire le commit précédent ; dans ce cas, relancer le run.

## Projet

- PWA vanilla (HTML/CSS/JS, sans framework ni étape de build), hébergée sur GitHub Pages : tous les chemins restent relatifs.
- Interface bilingue arabe (RTL) / français (LTR) : tout libellé ajouté l'est dans `STR.ar` **et** `STR.fr` de `js/app.js`.
- Deux thèmes (`night`, `cream`) : toute couleur passe par les variables CSS de `css/app.css`.
- Le texte coranique (`data/quran.json`, Tanzil Uthmani) ne doit jamais être modifié.
- Tester avec Playwright (Chromium est préinstallé, `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`) sur un viewport iPhone, dans les deux langues et les deux thèmes.
