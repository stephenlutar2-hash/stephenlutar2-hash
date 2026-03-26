# GitHub Packages — Registry Guide

This repository publishes packages to all five GitHub Packages registries. Each registry uses `GITHUB_TOKEN` for authentication — no extra secrets are needed.

---

## 1. npm (Node.js / TypeScript)

### Published Packages

| Package | Directory |
|---|---|
| `@szl-holdings/ui` | `lib/ui` |
| `@szl-holdings/platform` | `lib/platform` |
| `@szl-holdings/db` | `lib/db` |
| `@szl-holdings/api-spec` | `lib/api-spec` |
| `@szl-holdings/api-zod` | `lib/api-zod` |
| `@szl-holdings/api-client-react` | `lib/api-client-react` |
| `@szl-holdings/branding` | `lib/branding` |
| `@szl-holdings/lyte-types` | `lib/lyte-types` |
| `@szl-holdings/integrations-openai-ai-server` | `lib/integrations-openai-ai-server` |

### Authenticate

Create or edit `~/.npmrc` (or the project-level `.npmrc`):

```
@szl-holdings:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

### Install a Package

```bash
npm install @szl-holdings/ui
```

### Publish

Publishing happens automatically via the **Publish npm Packages** workflow (`.github/workflows/publish-npm.yml`), triggered on GitHub release or manual dispatch.

To publish manually from your machine:

```bash
cd lib/ui
npm publish --registry https://npm.pkg.github.com
```

---

## 2. Container Registry (Docker)

### Image

```
ghcr.io/szl-holdings/szl-holdings
```

### Authenticate

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

### Pull the Image

```bash
docker pull ghcr.io/szl-holdings/szl-holdings:latest
docker pull ghcr.io/szl-holdings/szl-holdings:sha-abc1234
```

### Publish

Publishing happens automatically via the **Publish Container Image** workflow (`.github/workflows/publish-container.yml`), triggered on push to `main` or manual dispatch. Images are tagged with the commit SHA and `latest`.

To build and push manually:

```bash
docker build -t ghcr.io/szl-holdings/szl-holdings:latest .
docker push ghcr.io/szl-holdings/szl-holdings:latest
```

---

## 3. Maven (Java)

### Package

- **Group ID:** `com.szlholdings`
- **Artifact ID:** `example`
- **Location:** `packages/maven-example/`

### Authenticate

Add the following server entry to your `~/.m2/settings.xml`:

```xml
<servers>
  <server>
    <id>github</id>
    <username>USERNAME</username>
    <password>YOUR_GITHUB_TOKEN</password>
  </server>
</servers>
```

### Install as a Dependency

Add the repository and dependency to your `pom.xml`:

```xml
<repositories>
  <repository>
    <id>github</id>
    <url>https://maven.pkg.github.com/szl-holdings/szl-holdings</url>
  </repository>
</repositories>

<dependencies>
  <dependency>
    <groupId>com.szlholdings</groupId>
    <artifactId>example</artifactId>
    <version>0.1.0</version>
  </dependency>
</dependencies>
```

### Publish

Publishing happens via the **Publish Maven Package** workflow (`.github/workflows/publish-maven.yml`), triggered on GitHub release or manual dispatch.

To publish manually:

```bash
cd packages/maven-example
mvn deploy
```

---

## 4. NuGet (.NET)

### Package

- **Package ID:** `SzlHoldings.Example`
- **Location:** `packages/nuget-example/`

### Authenticate

```bash
dotnet nuget add source \
  --username USERNAME \
  --password YOUR_GITHUB_TOKEN \
  --store-password-in-clear-text \
  --name github \
  "https://nuget.pkg.github.com/szl-holdings/index.json"
```

### Install as a Dependency

```bash
dotnet add package SzlHoldings.Example --version 0.1.0
```

### Publish

Publishing happens via the **Publish NuGet Package** workflow (`.github/workflows/publish-nuget.yml`), triggered on GitHub release or manual dispatch.

To publish manually:

```bash
cd packages/nuget-example
dotnet pack --configuration Release
dotnet nuget push bin/Release/*.nupkg --source "github" --api-key YOUR_GITHUB_TOKEN
```

---

## 5. RubyGems

### Package

- **Gem name:** `szl-holdings-example`
- **Location:** `packages/rubygems-example/`

### Authenticate

Create `~/.gem/credentials` with:

```yaml
---
:github: Bearer YOUR_GITHUB_TOKEN
```

Then set permissions:

```bash
chmod 0600 ~/.gem/credentials
```

### Install as a Dependency

Add to your `Gemfile`:

```ruby
source "https://rubygems.pkg.github.com/szl-holdings" do
  gem "szl-holdings-example", "~> 0.1.0"
end
```

Or install directly:

```bash
gem install szl-holdings-example \
  --source "https://rubygems.pkg.github.com/szl-holdings"
```

### Publish

Publishing happens via the **Publish RubyGem** workflow (`.github/workflows/publish-rubygems.yml`), triggered on GitHub release or manual dispatch.

To publish manually:

```bash
cd packages/rubygems-example
gem build szl-holdings-example.gemspec
gem push --key github --host https://rubygems.pkg.github.com/szl-holdings szl-holdings-example-0.1.0.gem
```

---

## Workflow Summary

| Registry | Workflow File | Trigger |
|---|---|---|
| npm | `.github/workflows/publish-npm.yml` | Release / Manual |
| Container | `.github/workflows/publish-container.yml` | Push to main / Manual |
| Maven | `.github/workflows/publish-maven.yml` | Release / Manual |
| NuGet | `.github/workflows/publish-nuget.yml` | Release / Manual |
| RubyGems | `.github/workflows/publish-rubygems.yml` | Release / Manual |

All workflows authenticate using the built-in `GITHUB_TOKEN` — no additional secrets are required.
