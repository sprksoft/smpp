# Required tools

- npm 11.10.1 (Most versions will work)

# How to build the extension for Firefox

1. Run `npm install` in the root directory to install all required packages.
2. Run `npm run build` in the root directory.
3. Go to firefox about:debugging#/runtime/this-firefox
4. Click on `Load Temporary Addon` and pick the `extension` folder in the root directory.
5. Done
