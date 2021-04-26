# Overview

Tool to migrate jest tests using @salesforce/wire-service-jest-util v2.x to v3.x.

[@salesforce/wire-service-jest-util](https://github.com/salesforce/wire-service-jest-util/) v3.x changes the way of writing jest test for components using `@wire`, [see the migration guide](https://github.com/salesforce/wire-service-jest-util/blob/master/docs/migrating-from-version-2.x-to-3.x.md). This package goal is to help you migrate existing tests into the new format established by [@salesforce/wire-service-jest-util](https://github.com/salesforce/wire-service-jest-util/) library.

## Usage

### Clone this repository
```shell
git clone --depth 1 git@github.com:jodarove/wire-service-jest-util-migrate.git
cd wire-service-jest-util-migrate
```

### Install npm dependencies
```shell
npm install
```

## Change existing tests

Once the project is installed, you can migrate your existing tests by running:

`npm run transform ~/projects/github/lwc-recipes/**/*.test.js`

You can pass any of the options defined in [jscodeshift](https://github.com/facebook/jscodeshift). 

