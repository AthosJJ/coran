# وِرد · Wird

PWA de suivi de lecture et de mémorisation du Coran (lecture **Ḥafṣ ʿan ʿĀṣim**), en HTML/CSS/JS vanilla, sans framework ni backend. Entièrement fonctionnelle hors ligne et installable sur l'écran d'accueil (iOS 16.4+, Android).

## Fonctionnalités

- **Chrono de lecture** — bouton Démarrer/Arrêter au centre d'un anneau de progression vers l'objectif quotidien (réglable dans Réglages). Chaque session est enregistrée ; le chrono survit à la fermeture de l'app (horodatage persistant).
- **Suivi des 114 sourates** — trois états cyclables : non commencée → en cours de mémorisation → mémorisée. Filtres par état, **recherche** (nom arabe, translittération, nom français ou numéro, insensible aux accents et harakāt) et **tri** (ordre du mushaf, les plus courtes d'abord, par état).
- **Lecture d'une sourate** — taper une sourate ouvre son texte intégral (bismillah + versets en écriture Uthmani). Toucher un verset y pose le **signet de reprise** ; l'accueil affiche alors une carte « Reprendre la lecture » qui rouvre la sourate au bon verset.
- **Révision intelligente** — tire une sourate parmi les mémorisées avec **pondération par ancienneté de révision** (les moins révisées récemment sortent en priorité, les jamais révisées d'abord), puis un verset aléatoire, avec « verset suivant » et « autre sourate ». Fonctionne 100 % hors ligne.
- **Statistiques** — sourates mémorisées, temps total, série (streak) de jours consécutifs avec record, cumuls par jour et par semaine, barres des 7 derniers jours.
- **Réglages** — thème nuit/jour, langue arabe (RTL) / français (LTR), objectif quotidien, **export/import des données** (fichier JSON), **réinitialisation** (avec double confirmation) et **recherche de mise à jour**. Les boutons rapides thème/langue restent en haut d'écran, à position fixe quelle que soit la langue.

## Données coraniques : source et raisons du choix

Le texte embarqué (`data/quran.json`, 114 sourates, **6 236 versets**) provient de l'édition **Uthmani du projet [Tanzil](https://tanzil.net)** (riwāya Ḥafṣ ʿan ʿĀṣim), distribuée en JSON par [risan/quran-json](https://github.com/risan/quran-json).

Pourquoi ce choix :

1. **Fiabilité** — Tanzil est le texte numérique de référence utilisé par la plupart des applications coraniques : vérifié automatiquement puis relu manuellement, avec une politique stricte d'intégrité du texte.
2. **Conformité Hafs** — l'édition Uthmani suit l'orthographe du Mushaf de Médine et le décompte koufien de 6 236 āyāt, qui est celui de la lecture Ḥafṣ. Les comptes par sourate ont été vérifiés un à un lors de la construction du fichier.
3. **Hors ligne** — contrairement à l'API Quran.com (excellente, mais dépendante du réseau à l'exécution), un JSON local est mis en cache par le service worker : la révision fonctionne sans aucune connexion.
4. **Cohérence typographique** — le texte Uthmani de Tanzil est précisément le jeu de caractères pour lequel la police KFGQPC a été dessinée (couverture vérifiée : tous les points de code du texte sont présents dans la police).

> ⚠️ Conformément à la licence Tanzil, le texte coranique est embarqué **sans aucune modification** et la source est créditée (ici et dans l'app). Si vous régénérez `data/quran.json`, ne modifiez jamais le champ `verses`.

## Typographie

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

1. **Settings → Pages → Build and deployment** : *Deploy from a branch*, choisir la branche et le dossier `/ (root)`.
2. Attendre la publication, puis ouvrir l'URL en HTTPS (requis pour le service worker).

### Installation sur iPhone (iOS 16.4+)

1. Ouvrir l'URL dans **Safari**.
2. Bouton **Partager** → **Sur l'écran d'accueil**.
3. L'app se lance en plein écran (standalone) et fonctionne ensuite hors ligne.

### Publier une mise à jour

1. Avant de pousser, incrémenter **`VERSION` dans `sw.js`** (ex. `wird-v3`) et **`APP_VERSION` dans `js/app.js`** (affichée dans Réglages).
2. Pousser sur la branche publiée par GitHub Pages.
3. Côté utilisateur, deux chemins :
   - **automatique** : au prochain lancement en ligne, le navigateur détecte le nouveau `sw.js`, installe la nouvelle version et l'app affiche un bandeau « Nouvelle version prête — Actualiser » ;
   - **manuel** : Réglages → « Rechercher une mise à jour » force la vérification, re-télécharge la coquille (requêtes conditionnelles, donc léger si rien n'a changé) et recharge l'app.

## Structure

```
index.html          coquille de l'app
css/app.css         thèmes nuit/crème, RTL/LTR, composants
js/app.js           logique (chrono, sourates, révision, stats, i18n)
data/quran.json     texte Uthmani Hafs complet + noms français
fonts/              KFGQPC Hafs, Reem Kufi, IBM Plex Sans Arabic (woff2)
icons/              icônes PWA (192, 512, maskable, apple-touch)
manifest.json       manifeste PWA
sw.js               service worker (pré-cache complet, cache-first)
```

## Licences

- **Code de l'app** : MIT (voir `LICENSE`).
- **Texte coranique** : projet Tanzil — redistribution autorisée à condition de ne pas modifier le texte et de créditer la source ([conditions](https://tanzil.net/docs/download)).
- **Police KFGQPC Uthmanic Script HAFS** : © Complexe du Roi Fahd pour l'impression du Noble Coran, diffusée gratuitement.
- **Reem Kufi**, **IBM Plex Sans Arabic** : SIL Open Font License 1.1.
