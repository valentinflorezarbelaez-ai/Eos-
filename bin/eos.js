#!/usr/bin/env node

/**
 * @file bin/eos.js
 * @description Executable CLI entrypoint for EOS Autonomous Engineering Control Plane.
 */

import { MissionCLI } from '../src/cli/mission-cli.js';

const cli = new MissionCLI({ baseDir: process.cwd() });

cli.run(process.argv.slice(2)).then(res => {
  if (res.output) {
    if (res.success) {
      console.log(res.output);
    } else {
      console.error(res.output);
    }
  }
  process.exit(res.success ? 0 : 1);
}).catch(err => {
  console.error(`Fatal CLI Error: ${err.message}`);
  process.exit(1);
});
