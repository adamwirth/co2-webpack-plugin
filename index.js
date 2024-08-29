const { averageIntensity } = require('@tgwf/co2');
const { validate } = require('schema-utils');

// Schema for the options object
const schema = {
  type: 'object',
  properties: {
    outputFile: {
      type: 'string',
    },
    country: {
      description: 'A code from in averageIntensity.data. For example, \'FIN\'. See <https://github.com/thegreenwebfoundation/co2.js/blob/main/data/output/average-intensities.js> for more information.',
      type: 'string',
    },
    encoding: {
      type: 'string',
    },
    emitOneNewFile: {
      description: 'You can stay pure to Webpack and emit a single row asset with this option. If disabled, uses `fs` after compilation finishes to attempt to append if there is an existing asset.',
      type: 'boolean',
    }
  },
};

class CO2Plugin {
  static defaultOptions = {
    outputFile: 'emissions-intensity-data.csv',
    encoding: 'utf-8',
    country: 'WORLD',
    emitOneNewFile: false,
  };

  constructor(options = {}) {
    validate(schema, options, {
      name: 'CO2.js Plugin',
      baseDataPath: 'options',
    });

    this.options = { ...CO2Plugin.defaultOptions, ...options };

    if (!averageIntensity.data.hasOwnProperty(this.options.country)) {
      throw new Error(`Invalid country: ${this.options.country}. It must be in averageIntensity.data. See https://github.com/thegreenwebfoundation/co2.js/blob/main/data/output/average-intensities.js for more information.`);
    }

    this.getRow = () => {
      const date = Date.now();
      const row = `${this.options.country},${averageIntensity.data[this.options.country]},${date}\n`;
      return row;
    }
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(
      'CO2Plugin',
      (compilation, compilationParameters) => {
        // This hook emits one file
        if (!this.options.emitOneNewFile) {
          console.debug("Not emitting during compilation");
          return false;
        }

        console.log('This is a CO2.js plugin!');

        const { RawSource } = compiler.webpack.sources;

        const row = this.getRow();

        if (compilation.assets[this.options.outputFile]) {
          console.log(`You may be invoking this plugin multiple times if its asset exists; appending to ${this.options.outputFile}.`);
          const existingContent = compilation.assets[this.options.outputFile].source();
          const newContent = existingContent + row;
          compilation.updateAsset(this.options.outputFile, new RawSource(newContent));
        } else {
          compilation.emitAsset(this.options.outputFile, new RawSource(row));
        }
      }
    );

    compiler.hooks.afterEmit.tapAsync('CO2Plugin', (compilation, callback) => {
      if (this.options.emitOneNewFile) {
        console.debug("Emit one new file false, exiting");
        callback();
        return;
      }

      console.log('This is a CO2.js plugin!');

      const outputFileSystem = compiler.outputFileSystem;
      const outputPath = compiler.options.output.path;
      const outputFile = `${outputPath}/${this.options.outputFile}`;
      const row = `${this.options.country},${averageIntensity.data[this.options.country]},${Date.now()}\n`;

      // Check if the file exists
      outputFileSystem.exists(outputFile, (exists) => {
        if (exists) {
          // If the file exists, append the new row
          outputFileSystem.readFile(outputFile, this.options.encoding, (readErr, data) => {
            if (readErr) {
              console.error('Error reading file:', readErr);
              callback();
              return;
            }

            const newContent = data + row;
            outputFileSystem.writeFile(outputFile, newContent, this.options.encoding, (writeErr) => {
              if (writeErr) {
                console.error('Error appending to file:', writeErr);
              } else {
                console.log('Row appended successfully.');
              }
              callback();
            });
          });
        } else {
          // If the file doesn't exist, create it with the row
          outputFileSystem.writeFile(outputFile, row, this.options.encoding, (writeErr) => {
            if (writeErr) {
              console.error('Error writing new file:', writeErr);
            } else {
              console.log('New file created and row written successfully.');
            }
            callback();
          });
        }
      });
    });
  }
}

module.exports = { CO2Plugin };
