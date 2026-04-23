# Old.St Labs React Web App Template

## TODO
- set `animation={false}` to Modal and add a transition. This will fix the error `Warning: findDOMNode is deprecated in StrictMode`
- Flow name mapper (not working)
- UI testing
- Update script for create new route for setting which navigation it belong.

## Docker Dev Environment

Run the dev server in Docker — no local Node installation required.

**Prerequisites:** Docker Desktop

### First time / after `package.json` changes

```bash
docker compose build
```

### Start dev server

```bash
docker compose up
```

Open [http://localhost:3000](http://localhost:3000). Hot reload is enabled via filesystem polling.

### Run in background

```bash
docker compose up -d
docker compose logs -f   # tail logs
```

### Stop

```bash
docker compose down
```

### Install a new package

```bash
docker compose run --rm app npm install <package>
docker compose build
```

> **Note:** The image uses `node:14-buster` with `linux/amd64` emulation due to `node-sass@4.14.1` requiring Python 2 and pre-built binaries only existing for Node 14. The `.env` file is loaded via `env_file` and never baked into the image.

---

## Available Scripts

Clone repo
### `git clone https://gitlab.com/project-structure-templates/react-web-app.git`

Install packages
### `npm install` or `yarn install`

In the project directory, you can run:
### `npm start` or `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm build` or `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Releasing / Versioning

The current version is shown at the bottom of the sidebar once logged in. It reads from `package.json#version`.

Versioning is automated via [`commit-and-tag-version`](https://github.com/absolute-version/commit-and-tag-version) and driven by conventional commits (`feat:`, `fix:`, `perf:`, `BREAKING CHANGE:`).

### First-ever release (one-time)

The first release needs a flag so the tool doesn't look for a non-existent previous tag:

```bash
npm run release:first
git push --follow-tags origin master
```

This seeds `v1.0.0` and creates `CHANGELOG.md`.

### Subsequent releases

```bash
npm run release
git push --follow-tags origin master
```

The tool inspects commits since the last tag and auto-bumps:

| Commit type | Bump |
|---|---|
| `fix: …` | patch (`1.0.0` → `1.0.1`) |
| `feat: …` | minor (`1.0.0` → `1.1.0`) |
| Any commit body containing `BREAKING CHANGE:` | major (`1.0.0` → `2.0.0`) |

`package.json` is updated, `CHANGELOG.md` is regenerated, a `chore(release): x.y.z` commit is created, and a `vx.y.z` git tag is placed on it.

### Dry run

To preview what the next release will do without writing anything:

```bash
npm run release -- --dry-run
```

## Code-generation

The project comes with code creation to speed things up.

**Routes**

`npm run create route MyNewRoute` or `yarn run create route MyNewRoute`

This will create 
```
├── containers
|   ├── MyNewRoute (New)
    |   ├── MyNewRouteContainer.js
    |   ├── MyNewRouteScreen.js
    |   ├── my-new-route.scss
└── ... other route containers
```

also import the route and add an entry in `routes` array of `/src/config/routes.js`

**Components**

`npm run create component MyNewComponent` or `yarn run create component MyNewComponent`

This will create 
```
├── components
|   ├── MyNewComponent (New)
    |   ├── MyNewComponent.js
    |   ├── MyNewComponent.stories.js
    |   ├── my-new-component.scss
└── ... other components
```


