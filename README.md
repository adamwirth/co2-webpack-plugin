# co2-webpack-plugin

A Webpack plugin to emit an emissions artifact to chart code against.
Uses the package [CO2.js](https://github.com/thegreenwebfoundation/co2.js) to report average emissions, updated monthly.

## Overview

The `co2-webpack-plugin` is a tool for developers who are conscious about the environmental impact of their code.
This plugin generates an artifact during your Webpack build process that can help chart the emissions associated with your company's relevant compiled code.
By integrating this into your workflow, you can keep track of your carbon footprint and take steps to reduce it.

## Installation

You can install this plugin via npm:

```bash
npm install --save-dev co2-webpack-plugin
```

Yarn:

```bash
yarn add --dev co2-webpack-plugin
```

## Example usage

```javascript
// webpack.config.js (ESM)
import Co2WebpackPlugin from 'co2-webpack-plugin';

export default {
  // ...
  plugins: [
    new Co2WebpackPlugin({
      country: 'USA'

    }),
  ],
};
```

```javascript
// webpack.config.js (CommonJS)
const Co2WebpackPlugin = require('co2-webpack-plugin');

module.exports = {
  // ...
  plugins: [
    new Co2WebpackPlugin({
      country: 'USA'

    }),
  ],
};
```

## Options

- `country`: all-caps country to report average emissions from. Default: `'WORLD'`
- `encoding`: output file encoding. Default: '`utf-8`'
- `outputFile`: filename. Default: `''emissions-intensity-data.csv'`
- `emitOneNewFile`: Feature to emit as a webpack asset as part of compilation.
  Use if you are not appending to an existing output file.
  Default: `false`

## Dependencies

This plugin depends on the following package:

[@tgwf/co2](https://www.npmjs.com/package/@tgwf/co2): A package to calculate emissions data.

## Contributing

Contributions are welcome!
Please open an issue or submit a pull request on GitHub.

## TODO List

- Get feedback!
  - What file format is wanted? I would guess JSON should be supported
  - How can these integrate into some automated charting?
  - For the charting, can this also tap into webpack size information, and add that as a column?
- Date format option
- Test suite against funky options
- Helpful error messages for common errors. "Did you mean ...?".
- More serious webpack logging integration, like verbosity
- Working with other plugins that might help, if they are present, like a CSV one that appends
- Reading up on publishing with npm
