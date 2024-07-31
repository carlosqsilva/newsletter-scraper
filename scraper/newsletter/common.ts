import { extractFactory } from "./javascripweekly/index.ts";

export const extractFrontendFocus = extractFactory(
  "frontendfocus",
  "https://frontendfoc.us/issues",
);

export const extractNodeWeekly = extractFactory(
  "nodeweekly",
  "https://nodeweekly.com/issues",
);

export const extractReactStatus = extractFactory(
  "reactstatus",
  "https://react.statuscode.com/issues",
);

export const extractGolangWeekly = extractFactory(
  "golangweekly",
  "https://golangweekly.com/issues",
);

export const extractRubyWeekly = extractFactory(
  "rubyweekly",
  "https://rubyweekly.com/issues",
);

export const extractPostgresWeekly = extractFactory(
  "postgresweekly",
  "https://postgresweekly.com/issues",
);
