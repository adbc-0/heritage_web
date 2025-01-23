# Heritage single page application deployable on VPS

## Local Development

### Requirements

- Docker
- Adding local domain to /etc/host. Script append_host.sh can be used here.

### Development

Build project

```
docker compose -f compose-dev.yml build
```

Run project

```
docker compose -f compose-dev.yml up -d
```

## Data

Use scripts in heritage data project to generate new json file and postgres init script.

## Deployment

### VPS

1. Pick OS on VPS. Use Debian or Ubuntu as a base.
2. Buy Domain. Point domain at VPS.
3. Download git and docker on VPS.
4. Setup SSH. Download repositories.
5. Run docker compose.

Connect to vps

```
ssh name@host
```

Copy files on service to local dir. Use -r option to copy directory.

```
scp -r user@host:/root/app/heritage/api/public/I70 ~/Downloads
```

Copy files in local dir to remote service. Use -r option to copy directory.

```
scp /Users/username/Desktop/11.jpeg username@host:/home/xxx/xxx
```

### Docker Commands

Estimate disk space that docker takes

```
docker system df -v
```

Full docker cleanup

```
docker system prune -a
```

## Postgres

### Maintenance

- Updating Postgres image version

## Rest Api

### Maintenance

- Updating Golang image version

## Web App

### Logo

SVG generated using inkscape.
Font used for logo: Monsterrat

### Maintenance

- Updating Node image version to latest TLS
- Update dependencies from package.json

### Resources

[Theming with shadcn/ui](https://ui.shadcn.com/docs/theming)

## Server

### Maintenance

- Updating Caddy image version
