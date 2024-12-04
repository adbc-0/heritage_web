# Heritage single page application deployable on VPS

## Deployment

### VPS

- Install Ubuntu on VPS. Use Ubuntu or Debian as base.
- Buy Domain. Point domain at VPS.
- Download git and docker on VPS.
- Setup SSH. Download repositories.
- Install docker.
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

### Maintenance
- Updating Golang image version

## Frontend

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