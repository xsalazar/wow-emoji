# 🌈 Wow Emoji

This repository contains the source code for the website [https://wowemoji.dev](https://wowemoji.dev).

This website allows for automated and quick creation of `:wow:` emoji, frequently and joyfully used at Slack. These emoji are used to celebrate and uplift coworkers that make you say "wow". They're colorful, they're animated, and they're delightful.

## Getting Started

This repository leverages [VSCode's devcontainer](https://code.visualstudio.com/docs/remote/containers) feature to ensure all necessary dependencies are available inside the container for development.

### Application

To get started:

```bash
npm init && npm start
```

This will start the application on your local machine, running on [http://localhost:3000/](http://localhost:3000).

⚠️ Note that image requests will not work locally as the backend only allows CORS requests from [https://wowemoji.dev](https://wowemoji.dev).

### Deployments

All application deployments are managed via GitHub Actions and the [`./.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) workflow.

Additionally, application dependencies are automatically managed and updated via Dependabot and the [`./.github/workflows/automerge-dependabot.yml`](./.github/workflows/automerge-dependabot.yml) workflow.
