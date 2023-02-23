/* eslint-disable func-names */
import fs from 'fs';
import assert from 'assert';
import vkbeautify from '../lib/vkbeautify';
import dropcss from '../../src/dropcss';

describe('Bulma-Bootstrap-Surveillance', function () {
  describe('stress test', function () {
    it('should run', function () {
      const { css: out } = dropcss({
        html: fs.readFileSync(
          `${__dirname}/../bench/stress/input/surveillance.html`,
          'utf8'
        ),
        css:
          fs.readFileSync(
            `${__dirname}/../bench/stress/input/bootstrap.min.css`,
            'utf8'
          ) +
          fs.readFileSync(
            `${__dirname}/../bench/stress/input/bulma.min.css`,
            'utf8'
          ),
      });

      assert.strictEqual(
        vkbeautify(out),
        fs.readFileSync(
          `${__dirname}/../bench/stress/output/dropcss.pretty.css`,
          'utf8'
        )
      );
    });
  });
});
