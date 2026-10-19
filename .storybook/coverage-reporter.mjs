// Storybook 10.6's coverage reporter exports its class only as "module.exports", but
// Vitest 5's report loader needs a default export, so coverage runs crash Storybook.
// vitest.config.ts swaps the addon's reporter for this re-export.
import * as reporter from "@storybook/addon-vitest/internal/coverage-reporter";

export default reporter.default ?? reporter["module.exports"];
