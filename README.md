# typed-regexp
A typescript package that strongly restricts types of regular expressions.

## Example
```ts
import { TypedRegExp } from "typed-regexp";

const string = "string to match";
const regexp = new TypedRegExp<[`{${string}`],{group:"a"|"b"}>("(?<group>[ab])({.*)");
/* can also be this:
const regexp = /(?<group>[ab])({.*)/ as TypedRegExp<[`{${string}`],{group:"a"|"b"}>;
*/
const match = string.match(regexp);
if (match) {
  const namedGroup = match.groups.group;
  // => "a"|"b"
  const group = match[1];
  // => `{${string}`
}
```
