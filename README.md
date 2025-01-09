# Heritage single page application deployable on VPS

## Local Development

### Requirements

- Docker
- Adding local domain to /etc/host. Script append_host.sh can be used here.

### Run Locally

Build project

```
docker compose -f compose-dev.yml build
```

Run project

```
docker compose -f compose-dev.yml up -d
```

### Run Dev

## Data

Use heritage data project to generate new json file and postgres init script.

## Deployment

### VPS

- Pick OS on VPS. Use Debian or Ubuntu as a base.
- Buy Domain. Point domain at VPS.
- Download git and docker on VPS.
- Setup SSH. Download repositories.
- Run docker compose.

### Docker

Estimate size that docker takes

```
docker system df -v
```

Docker cleanup

```
docker system prune -a
```

## Postgres

Postgres is used as a database for storing user notes

### Maintenance

- Updating Postgres image version

## Rest Api

### Maintenance

- Updating Golang image version

## Web App

### SVG

SVG generated using inkscape.
Font used for logo: Monsterrat

### Maintenance

- Updating Node image version to latest TLS
- Update dependencies from package.json

### Commands

Update shadcn components

```
npx shadcn-ui@latest add -a -y -o
```

### Resources

[Theming with shadcn/ui](https://ui.shadcn.com/docs/theming)

## Server

Caddy on server for easy https

### Maintenance

- Updating Caddy image version
