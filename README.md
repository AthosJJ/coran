# وِرد · Wird

PWA de suivi de lecture et de mémorisation du Coran (lecture **Ḥafṣ ʿan ʿĀṣim**), en HTML/CSS/JS vanilla, sans framework ni backend. Entièrement fonctionnelle hors ligne et installable sur l'écran d'accueil (iOS 16.4+, Android).

## Fonctionnalités

- **Chrono de lecture** — l'arc doré de l'anneau fait un tour complet par minute (comme un chronomètre) ; l'anneau intérieur montre la progression vers l'objectif du jour et passe au vert une fois atteint. Le grand chiffre donne la lecture du jour, le libellé la durée de la séance en cours. Hors de l'accueil, une pastille en haut de l'écran rappelle que le chrono tourne (un tap l'arrête). Les sessions sont découpées à minuit, un tap accidentel de moins de 10 s n'est pas compté, chaque session enregistrée peut être annulée, et un chrono resté ouvert plus de 3 h déclenche une question (saisir la durée réelle, tout garder ou ignorer).
- **Suivi des 114 sourates** — trois états : non commencée → en cours de mémorisation → mémorisée (légende au premier lancement, annulation si une sourate mémorisée est décochée). **Recherche** tolérante (arabe sans harakāt, translittération, nom français, graphies françaises comme « nour » ou « yassine », numéro) avec bouton d'effacement, filtres et tri.
- **Lecteur de sourate** — texte Uthmani intégral, barre collée en haut (retour, nom de la sourate, révision masquée, « aller au verset »), **signet de reprise** posé d'un tap (avec annulation), carte « Reprendre la lecture » sur l'accueil, fin de sourate avec « Sourate suivante » et choix du statut. La position de lecture survit aux changements d'onglet et à une relance de l'app ; l'écran reste allumé pendant la lecture.
- **Révision masquée** — tirage pondéré par ancienneté de révision parmi les sourates mémorisées (ou révision d'une sourate précise depuis le lecteur). La sourate s'affiche masquée en pointillés (le premier verset visible), on révèle chaque verset d'un tap après l'avoir récité. Les longues sourates (plus de 40 versets) se révisent **par passages de 20 versets**, qui s'enchaînent d'une fois sur l'autre. La session survit à une relance ; abandonner une révision entamée demande confirmation.
- **Tajwid coloré** (optionnel) — voir la section dédiée ci-dessous.
- **Statistiques** — sourates mémorisées et part du Mushaf réellement couverte (en versets), temps total, série de jours avec record, barres des 7 derniers jours avec ligne d'objectif, historiques par jour et par semaine, mis à jour en direct pendant une séance.
- **Réglages** — thème nuit/jour, langue arabe (RTL) / français (LTR), objectif quotidien, taille du texte coranique (1 → 10, avec aperçu), tajwid, export/import JSON (avec confirmation et annulation), réinitialisation (double geste, annulable, les réglages sont conservés), recherche de mise à jour.
- **Accessibilité** — contrastes conformes WCAG AA dans les deux thèmes, cibles tactiles de 44 px, accords grammaticaux arabes (العدد والمعدود) et français, compatibilité VoiceOver (annonces, états, focus conservé), respect de « réduire les animations ».

## Données coraniques : source et raisons du choix

Le texte embarqué (`data/quran.json`, 114 sourates, **6 236 versets**) provient de l'édition **Uthmani du projet [Tanzil](https://tanzil.net)** (riwāya Ḥafṣ ʿan ʿĀṣim), distribuée en JSON par [risan/quran-json](https://github.com/risan/quran-json).

Pourquoi ce choix :

1. **Fiabilité** — Tanzil est le texte numérique de référence utilisé par la plupart des applications coraniques : vérifié automatiquement puis relu manuellement, avec une politique stricte d'intégrité du texte.
2. **Conformité Hafs** — l'édition Uthmani suit l'orthographe du Mushaf de Médine et le décompte koufien de 6 236 āyāt, qui est celui de la lecture Ḥafṣ. Les comptes par sourate ont été vérifiés un à un lors de la construction du fichier.
3. **Hors ligne** — contrairement à l'API Quran.com (excellente, mais dépendante du réseau à l'exécution), un JSON local est mis en cache par le service worker : la révision fonctionne sans aucune connexion.
4. **Cohérence typographique** — le texte Uthmani de Tanzil est précisément le jeu de caractères pour lequel la police KFGQPC a été dessinée (couverture vérifiée : tous les points de code du texte sont présents dans la police).

> ⚠️ Conformément à la licence Tanzil, le texte coranique est embarqué **sans aucune modification** et la source est créditée (ici et dans l'app). Si vous régénérez `data/quran.json`, ne modifiez jamais le champ `verses`.

## Tajwid coloré : source et limites

Les annotations (`data/tajweed.json`) dérivent de [cpfair/quran-tajweed](https://github.com/cpfair/quran-tajweed) (licence BSD), des règles générées algorithmiquement sur le texte Tanzil Uthmani de 2017. Comme l'encodage Tanzil a légèrement évolué depuis, les indices ont été **réalignés verset par verset** (alignement de séquences sur classes d'équivalence de codepoints) puis **validés caractère par caractère** : seuls les spans dont le texte correspond exactement sont embarqués — 99,4 % des 60 057 annotations, couvrant 6 171 versets sur 6 236. Les ~0,5 % restants sont simplement non colorés (jamais colorés à tort), et des invariants par règle (hamzat al-waṣl = « ٱ », qalqala contient une lettre de قطبجد, etc.) ont tous été vérifiés.

> ⚠️ Cette coloration est **générée automatiquement et indicative**. Elle aide à repérer les règles mais ne remplace ni un mushaf tajwid imprimé ni l'apprentissage auprès d'un enseignant. C'est pourquoi l'option est désactivée par défaut, avec un avertissement dans les Réglages.

## Typographie

> Affichage : la police KFGQPC ne dessine pas le petit mîm bas (U+06ED) qui suit une kasra (iqlāb sous tanwīn kasra, 99 occurrences) et affiche un cercle pointillé à la place. L'app le remplace **à l'affichage uniquement** par U+06E2, que la police place sous la lettre comme dans le Mushaf de Médine ; le fichier `data/quran.json` reste le texte Tanzil inchangé.

| Usage | Police | Fichier |
|---|---|---|
| Texte coranique | **KFGQPC Uthmanic Script HAFS** (Complexe du Roi Fahd) | `fonts/UthmanicHafs.woff2` |
| Titres | Reem Kufi (OFL) | `fonts/ReemKufi.woff2` |
| Interface (ar + fr) | IBM Plex Sans Arabic (OFL) | `fonts/IBMPlexSansArabic-*.woff2` |

La police Hafs est la conversion woff2 de la police officielle du KFGQPC, récupérée depuis [mustafa0x/qpc-fonts](https://github.com/mustafa0x/qpc-fonts). Toutes les polices sont embarquées et déclarées en `@font-face` — aucun appel réseau.

## Stockage

`localStorage` (clé `wird:v1`) plutôt qu'IndexedDB : les données (état des 114 sourates, journal des sessions, signet, dates de dernière révision, préférences) pèsent quelques Ko par an d'utilisation, l'API synchrone simplifie le code, et la persistance est suffisante pour une PWA installée. Les agrégats (jours, semaines, streak) sont recalculés à partir du journal des sessions, qui reste la seule source de vérité. L'export JSON (Réglages → Données) sert de sauvegarde et de passerelle entre appareils.

## Déploiement sur GitHub Pages

Tous les chemins sont relatifs : l'app fonctionne servie depuis un sous-chemin (`https://<user>.github.io/<repo>/`).

Le dépôt n'a qu'**une seule branche, `main`**, qui est à la fois la branche par défaut et la source de GitHub Pages.

1. **Settings → Pages → Build and deployment** : *Deploy from a branch*, branche **`main`**, dossier `/ (root)`.
2. Attendre la publication, puis ouvrir l'URL en HTTPS (requis pour le service worker).

### Installation sur iPhone (iOS 16.4+)

1. Ouvrir l'URL dans **Safari**.
2. Bouton **Partager** → **Sur l'écran d'accueil**.
3. L'app se lance en plein écran (standalone) et fonctionne ensuite hors ligne.

### Publier une mise à jour

1. Avant de pousser, incrémenter **`VERSION` dans `sw.js`** (ex. `wird-v3`) et **`APP_VERSION` dans `js/app.js`** (affichée dans Réglages).
2. Pousser sur `main`, puis vérifier dans l'onglet **Actions** que le run « pages build and deployment » a construit ce commit-là (un build lancé à la seconde du push peut reprendre le commit précédent : il suffit alors de relancer le run).
3. Côté utilisateur, deux chemins :
   - **automatique** : au prochain lancement en ligne, le navigateur détecte le nouveau `sw.js`, installe la nouvelle version et l'app affiche un bandeau « Nouvelle version prête — Actualiser » ;
   - **manuel** : Réglages → « Rechercher une mise à jour » force la vérification, re-télécharge la coquille (requêtes conditionnelles, donc léger si rien n'a changé) et recharge l'app.

## Structure

```
index.html          coquille de l'app
css/app.css         thèmes nuit/crème, RTL/LTR, composants
js/app.js           logique (chrono, sourates, révision, stats, i18n)
data/quran.json     texte Uthmani Hafs complet + noms français
data/tajweed.json   annotations tajwid réalignées et vérifiées (cpfair/quran-tajweed)
fonts/              KFGQPC Hafs, Reem Kufi, IBM Plex Sans Arabic (woff2)
icons/              icônes PWA (192, 512, maskable, apple-touch)
manifest.json       manifeste PWA
sw.js               service worker (pré-cache complet, cache-first)
```

## Licences

- **Code de l'app** : MIT (voir `LICENSE`).
- **Texte coranique** : projet Tanzil — redistribution autorisée à condition de ne pas modifier le texte et de créditer la source ([conditions](https://tanzil.net/docs/download)).
- **Annotations tajwid** : [cpfair/quran-tajweed](https://github.com/cpfair/quran-tajweed), licence BSD 2-Clause.
- **Police KFGQPC Uthmanic Script HAFS** : © Complexe du Roi Fahd pour l'impression du Noble Coran, diffusée gratuitement.
- **Reem Kufi**, **IBM Plex Sans Arabic** : SIL Open Font License 1.1.
