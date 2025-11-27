> :warning: Warning! This project is in its very early stages of development. Expect frequent changes and potential breaking updates as we iterate on features and architecture.

# rancher-ai-ui

## Running for Development
This is what you probably want to get started.
```bash
# Install dependencies
yarn install

# For development, serve with hot reload at https://localhost:8005
# using the endpoint for your Rancher API
API=https://your-rancher yarn dev
# or put the variable into a .env file
# Goto https://localhost:8005
```

## Updating @shell package
This is about updating the @shell package which is the base from rancher/dashboard
```bash
# Update
yarn create @rancher/update
```

## Building the extension for production
Bump the app version on `package.json` file, then run:
```bash
# Build for production
./scripts/publish -g 
# add flag -f if you need to overwrite an existing version


# If you need to test the built extension
yarn serve-pkgs
```

## E2E tests
Running locally:
```bash
# Build and Run the mock Agent
cd mock-agent
yarn install
yarn start

# Launch dev UI
API=https://your-rancher VUE_APP_AGENT_MESSAGES_WS_PATH=ws://localhost:8000/ws/agent yarn dev

# Launch Cypress Dashboard
TEST_SKIP=setup TEST_PASSWORD=${rancher-password} yarn cypress:open
```

License
=======
Check Rancher AI UI Apache License details [here](LICENSE)
