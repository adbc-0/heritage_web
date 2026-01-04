# Heritage single page application deployable on VPS

## VPS and production environment

### Setting up VPS

1. Pick OS on VPS. Use Debian or Ubuntu as a base.
2. Buy Domain. Point domain at VPS.
3. Download docker on VPS.

### Requirements

- Docker
- Adding local domain to /etc/host. Script append_host.sh can be used for that.

### Accessing VPS

Connect to vps

```
ssh name@host
```

Copy files from server to local dir. Use -r to copy recursively.

```
scp -r user@host:/root/app/heritage/api/public/I70 ~/Downloads
```

Copy files from local dir to remote server. Use -r to copy recursively.

```
scp -r ~/Downloads user@host:/root/app/heritage/api/public
```

Adding ghcr token when it expires can be found in [github docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

### Usefull Docker commands

Estimate disk space that docker takes

```
docker system df -v
```

Full docker cleanup

```
docker system prune -a
```

Login using github pesonal access token. Important to update when regenerating access token.

```
echo "<personal_access_token>" | docker login ghcr.io -u <github-login> --password-stdin
```

## Web App

### Useful commands

Upgrade pnpm version

```
corepack use pnpm@latest
```

### Logo

SVG generated using inkscape.
Font used for logo: Monsterrat

### Resources

[Theming with shadcn/ui](https://ui.shadcn.com/docs/theming)
