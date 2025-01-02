# Heritage single page application deployable on VPS

## Heritage Data

User heritage data project to generate new json file and postgres init script.

## Local Development

Project and it's env variables are setup to allow easy frontend local development while api runs in docker.

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

## Backend

### Docker

Build docker image:

```
docker build -t heritage-api .
```

Run container in detached mode:

```
docker run -d -p 8080:8080 --name heritage_api heritage-api
```

### Postgres

Postgres is used as a database for storing user notes

### Maintenance

- Updating Golang image version

## Frontend

### SVG

Svg generated using inkscape. Font used: Monsterrat

### Docker

Build docker image

```
docker build -f docker/react.Dockerfile -t heritage-react .
```

Run container

```
docker run -d -p 80:80 --name heritage_react heritage-react
```

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
