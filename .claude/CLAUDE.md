# Claude Code Rules

## Rule 1: Read before writing
Before implementing any change that touches a library's API, read the compiled 
source first: `node_modules/[package]/dist/index.esm.js` (or equivalent). Do 
not rely on type definitions alone — they can be wrong. Do not rely on training 
knowledge — the installed version may differ. Quote the relevant source lines in 
the plan before writing any code.

## Rule 2: Scope discipline
If the spec says "do not change X", do not change X even if you think it's wrong. 
Flag it as a concern in the plan and wait for instruction. Do not silently fix 
things outside scope.

## Rule 3: Always report after every task
After every completed task provide: files changed, plain English summary of what 
was done, and anything intentionally not changed.