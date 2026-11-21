# Lauréat — Droit social belge

Application (PWA) de révision pour le test de juriste en droit social de la CSC du jeudi 10 décembre 2026 : cours du module 0 (les compétences générales du juriste : méthodes, gabarits et pièges) et des douze modules de matière, fiches mémo à réciter, cartes en répétition espacée, QCM corrigés, casus chronométrés avec corrigé et grille d'auto-évaluation, examen blanc noté sur 20, programme jour par jour jusqu'à l'épreuve et recherche dans toute la matière. Pensée pour la tablette (portrait et paysage), utilisable au téléphone, et fonctionnelle hors connexion après la première ouverture.

## Mise en ligne sur GitHub Pages
1. Le dépôt **public** [`Laureat`](https://github.com/yasl-byte/Laureat) contient tout le site à sa racine (GitHub Pages gratuit exige un dépôt public).
2. Dans le dépôt : Settings → Pages → Source : `Deploy from a branch`, branche `main`, dossier `/ (root)`, Save.
3. Une ou deux minutes plus tard, ouvrir `https://yasl-byte.github.io/Laureat/` dans Chrome sur la tablette. Sans passer par Median, menu ⋮ → « Installer l'application » suffit déjà.

## Emballage en APK avec Median.co
1. Créer une application Median à partir de l'adresse `https://yasl-byte.github.io/Laureat/`.
2. Nom : `Lauréat`. Icône : `icone-median-1024.png` (1024 × 1024, fournie dans ce dossier).
3. Couleurs conseillées : barre d'état `#7b1e2b` (bordeaux), fond de démarrage `#f6f1e7` (parchemin). Orientation : automatique, pour lire en portrait et réviser en paysage.
4. Générer l'APK Android et l'installer sur la tablette, comme pour vos autres applications.

## Mises à jour (nouveaux modules)
Chaque module publié remplace `data.js` (et, au besoin, `app.js`, `style.css` et `sw.js`). Ils sont déposés directement dans ce dépôt, et la tablette les reçoit à la prochaine ouverture avec connexion, **sans réinstaller l'APK** et sans toucher à votre progression. Réglages → « Rechercher une mise à jour » force la vérification.

## Fichiers
- `index.html` : structure de la page
- `style.css` : thèmes Parchemin et Nuit, mise en page tablette et téléphone
- `data.js` : tout le contenu (plan, calendrier, cours, fiches, cartes, QCM, casus, lexique), généré par `build.py` à partir des modules ; ne pas modifier à la main
- `app.js` : logique de l'application (répétition espacée, QCM, casus chronométrés, examen blanc, sauvegardes)
- `sw.js` : fonctionnement hors connexion (réseau d'abord : les mises à jour arrivent tout de suite)
- `manifest.json`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` : installation sur l'écran d'accueil
- `icone-median-1024.png` : icône à fournir à Median
- `eb-garamond-400.woff2`, `eb-garamond-400-italic.woff2`, `eb-garamond-600.woff2` : police EB Garamond (licence SIL Open Font License, voir `LICENSE-polices-OFL.txt`)

## Vos données
La progression (sections lues, cartes, QCM, erreurs, casus, examens blancs, réglages) reste sur l'appareil, dans le stockage local de l'application. Réglages → Progression : « Exporter un fichier » ou « Copier la sauvegarde » de temps en temps, « Importer un fichier » ou « Coller une sauvegarde » pour la restaurer.

La version installée depuis Chrome et l'APK Median ont chacune leur propre stockage : pour passer de l'une à l'autre, copiez la sauvegarde dans la première et collez-la dans la seconde. Si « Exporter un fichier » ne télécharge rien dans l'APK, « Copier la sauvegarde » fait le même office.
