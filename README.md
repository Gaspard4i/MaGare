# Ma Gare SNCF

Application web reproduisant les tableaux d'affichage des gares SNCF en temps reel. Consultez les departs et arrivees de n'importe quelle gare francaise, avec les retards, les quais et les details de chaque train.

**[Voir l'application en ligne](https://gaspard4i.github.io/MaGare)**

## Fonctionnalites

- **Tableau de departs & arrivees** en temps reel via l'API SNCF Navitia
- **Recherche de gare** avec autocompletion
- **Double vue desktop** : departs (bleu) et arrivees (vert) cote a cote
- **Vue mobile** : bascule departs/arrivees avec toggle
- **Detail d'un train** : feuille glissante avec tous les arrets du trajet, swipe vers le bas pour fermer
- **Filtrage par destination** : recherche et favoris de destinations par gare
- **Filtrage par date/heure** : selecteur date + heure avec scroll molette (±1 jour / ±5 min)
- **Gare par defaut** : sauvegardee en localStorage, chargee au demarrage
- **Favoris** : gares favorites avec tri alphabetique
- **Bulletin de retard** : formulaire generant un lien vers le site TER SNCF
- **Themes** : clair (`sncf`) et sombre (`sncf-dark`)
- **Couleurs de badges** : couleurs de lignes fournies par l'API (RER, Transilien), avec fallback SNCF pour TGV/OUIGO/TER/IC

## Stack technique

| Techno | Version | Role |
|--------|---------|------|
| React | 19 | UI |
| Vite | 7 | Bundler / dev server |
| TypeScript | 5.9 | Typage (transpile par esbuild) |
| Tailwind CSS | 4 | Utility-first CSS |
| DaisyUI | 5 | Composants UI / themes |
| FontAwesome | 7 | Icones |
| React Router | 7 | Routing SPA (BrowserRouter) |
| LZ-String | 1.5 | Compression URL bulletin |

## Architecture

Le projet suit le pattern **Atomic Design** :

```
src/
  atoms/          # Composants de base (TimeDisplay, StatusBadge, TrainTypeBadge, ...)
  molecules/      # Composants composes (SearchInput, StopItem, ModeToggle, ...)
  organisms/      # Sections completes (TrainBoard, TrainRow, SearchBar, Header, ...)
  pages/          # Pages de l'app (BoardPage, FavoritesPage, SettingsPage, ...)
  services/       # API et localStorage
  utils/          # Helpers (couleurs par mode)
  types/          # Interfaces TypeScript
```

### Pages

| Route | Page | Description |
|-------|------|-------------|
| `/horaires` | BoardPage | Tableau des departs/arrivees |
| `/bulletin` | BulletinPage | Formulaire bulletin de retard |
| `/favoris` | FavoritesPage | Gares favorites |
| `/reglages` | SettingsPage | Theme clair/sombre |

### API SNCF Navitia

L'application utilise l'[API SNCF](https://www.digital.sncf.com/startup/api) (basee sur Navitia) :

- `GET /stop_areas/{id}/departures` — departs en temps reel
- `GET /stop_areas/{id}/arrivals` — arrivees en temps reel
- `GET /places?q={query}` — recherche de gares
- `GET /vehicle_journeys/{id}` — detail d'un trajet (arrets)

### Couleurs des badges

Les badges de ligne utilisent les couleurs fournies par l'API (`display_informations.color` / `text_color`) quand elles sont disponibles. Pour les modes sans couleur API (TGV, OUIGO, TER...), des couleurs SNCF officielles sont utilisees en fallback :

| Mode | Couleur |
|------|---------|
| TGV INOUI | Lie-de-vin `#9B2743` |
| OUIGO | Cerulean `#0084D4` |
| TER | Foret `#154734` |
| Intercites | Ocre `#DC582A` |
| Transilien | Lavande `#6558B1` |
| RER | Cobalt `#003865` |
| Eurostar | Dore `#FFD700` |

## Installation

```bash
# Cloner le repo
git clone https://github.com/Gaspard4i/MaGare.git
cd MaGare

# Installer les dependances
npm install

# Configurer le token API SNCF
# Creer un fichier .env a la racine :
echo "VITE_SNCF_TOKEN=votre_token_sncf" > .env

# Lancer en dev
npm run dev
```

### Obtenir un token SNCF

1. Creer un compte sur [digital.sncf.com](https://www.digital.sncf.com/startup/api)
2. Souscrire a l'API Navitia
3. Copier le token dans le fichier `.env`

## Build & deploiement

```bash
# Build de production
npm run build

# Preview du build
npm run preview
```

### GitHub Pages

L'application est deployee automatiquement sur GitHub Pages via GitHub Actions a chaque push sur `main`.

**Configuration requise :**

1. Activer GitHub Pages dans les settings du repo (source : GitHub Actions)
2. Ajouter le secret `VITE_SNCF_TOKEN` dans Settings > Secrets and variables > Actions

Le deploiement gere le routing SPA via un `404.html` qui redirige vers `index.html` avec encodage du path.

## Stockage local

Toutes les donnees utilisateur sont stockees en `localStorage` :

| Cle | Contenu |
|-----|---------|
| `mg_default_station` | Gare par defaut (JSON) |
| `mg_favorites` | IDs des gares favorites |
| `mg_fav_places` | Donnees des gares favorites (JSON) |
| `mg_dest_favs` | Destinations favorites par gare |
| `mg_theme` | Theme actif (`sncf` ou `sncf-dark`) |

## Licence

Projet personnel — donnees fournies par l'API SNCF Navitia.
