Our front and backend servers are logging to the below files:

- **READ:** `_logs/claude-code-ui-backend.log`
- **READ:** `_/logs/claude-code-ui-frontend.log`

To make new debugging logs **READ**: `./tooling/logger/DEBUGGING.md`

- While `pnpm run brain:dev` is running you can recursively create logs to determine application outputs and use the logs to quickly see if they meet expectations. 
- Try fixes until the application logs show the correct behavior.

MANDATORY: AFTER YOU MAKE A CHANGE RERUN `/read-logs.md` TO CHECK YOUR WORK. AGAIN AND AGAIN UNTIL FIXED!