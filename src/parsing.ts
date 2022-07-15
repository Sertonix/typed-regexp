type Chars = Digits | Letters | OtherChars;
type SpecialRegExpChars = "$"|"("|")"|"*"|"+"|"?"|"["|"\\"|"]"|"^"|"|"|"."|"{"|"}";
type NonSpecialRegExpChars = Exclude<Chars,SpecialRegExpChars>;
type OtherChars = " "|"!"|"\""|"#"|"$"|"%"|"&"|"'"|"("|")"|"*"|"+"|","|"-"|"."|"/"|":"|";"|"<"|"="|">"|"?"|"@"|"["|"\\"|"]"|"^"|"_"|"`"|"{"|"|"|"}"|"~";
type Letters = LettersUpperCase | LettersLowerCase;
type LettersUpperCase = "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"|"N"|"O"|"P"|"Q"|"R"|"S"|"T"|"U"|"V"|"W"|"X"|"Y"|"Z";
type LettersLowerCase = "a"|"b"|"c"|"d"|"e"|"f"|"g"|"h"|"i"|"j"|"k"|"l"|"m"|"n"|"o"|"p"|"q"|"r"|"s"|"t"|"u"|"v"|"w"|"x"|"y"|"z";
type HexDigits = Digits|"a"|"b"|"c"|"d"|"e"|"f"|"A"|"B"|"C"|"D"|"E"|"F";
type Digits = "0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9";

// IDEA use { [k in string]: k } to support union types
// important: groups are undefined when not used in match
// important: this doesn't support non ascii characters
// IDEA support string parts with:
//  R extends `${infer C extends string}${infer R extends string}` ? string extends C ? {g:GroupsArray,n:NamedGroups,r:R} : undefined : undefined
// TODO throw error on douplicated group name
// IDEA use return value to pass usefull error information

type GroupsArray = Array<string|undefined>;
type NamedGroups = {[k:string]:string|undefined};

/** normal parsing */
type Parse<R extends string> =
    R extends "" ? { g: [], ng: {} } :
    ParsePart<R> extends { g: infer G extends GroupsArray, ng: infer NG extends NamedGroups, r: infer R extends string } ?
        Parse<R> extends { g: infer G2 extends GroupsArray, ng: infer NG2 extends NamedGroups } ? { g: [...G,...G2], ng: NG & NG2 } :
        undefined :
    undefined;

/** start group parsing */
type ParseGroup<R extends string> =
    R extends `?${infer R extends string}` ?
        R extends `:${infer R extends string}` ? ParseGroup_<R> :
        R extends `=${infer R extends string}` ? ParseGroup_<R> :
        R extends `!${infer R extends string}` ? ParseGroup_<R> :
        R extends `<${infer R extends string}` ?
            R extends `=${infer R extends string}` ? ParseGroup_<R> :
            R extends `!${infer R extends string}` ? ParseGroup_<R> :
            ParseGroupName<R> extends { ng: infer NG extends NamedGroups, r: infer R extends string } ?
                ParseGroup_<R> extends { g: infer G2 extends GroupsArray, ng: infer NG2 extends NamedGroups, r: infer R extends string } ? { g: G2, ng: NG & NG2, r: R } : undefined :
            undefined :
        undefined :
    ParseGroup_<R> extends { g: infer G extends GroupsArray, ng: infer NG extends NamedGroups, r: infer R extends string } ? { g: [string,...G], ng: NG, r: R } :
    R extends `${infer C extends string}${infer R extends string}` ? string extends C ? { g: GroupsArray, ng: NamedGroups, r: R } : undefined : undefined;

type ParseGroupName<R extends string> =
    R extends `${infer N extends Letters|"_"}${infer R extends string}` ? ParseGroupName_<R,N> :
    undefined;

type ParseGroupName_<R extends string, Name extends string> =
    R extends `>${infer R extends string}` ? { ng: {[ng in Name]:string}, r: R } :
    R extends `${infer N extends Letters|Digits|"_"}${infer R extends string}` ? ParseGroupName_<R,`${Name}${N}`> :
    undefined;

/** loop group parsing */
type ParseGroup_<R extends string> =
    R extends `)${infer R extends string}` ? { g:[], ng: {}, r: R } :
    ParsePart<R> extends { g: infer G extends GroupsArray, ng: infer NG extends NamedGroups, r: infer R extends string } ? ParseGroup_<R> extends { g: infer G2 extends GroupsArray, ng: infer NG2 extends NamedGroups, r: infer R extends string } ? { g: [...G,...G2], ng: NG & NG2, r: R } : undefined :
    undefined;

/** parse parts with modifiers ? * + and there greedy versions */
type ParsePart<R extends string> =
    ParsePart_<R> extends { g: infer G extends GroupsArray, ng: infer NG extends NamedGroups, r: infer R extends string } ?
        R extends `?${"?"|""}${infer R extends string}` ? { g: G, ng: NG, r: R } | { g: ArrayWithLength<undefined,G["length"]>, ng: {[k in keyof NG]:undefined}, r: R } : // BUG causes recursion error
        R extends `+${"?"|""}${infer R extends string}` ? { g: G, ng: NG, r: R } :
        R extends `*${"?"|""}${infer R extends string}` ? { g: G, ng: NG, r: R } | { g: ArrayWithLength<undefined,G["length"]>, ng: {[k in keyof NG]:undefined}, r: R } : // BUG causes recursion error
        // R extends `{${infer R extends string}` ? {g:G,r:R} :
        { g: G, ng: NG, r: R } :
    undefined;

/* parse parts without modifiers */
type ParsePart_<R extends string> =
    R extends `${infer _A extends NonSpecialRegExpChars|"."|"$"|"^"}${infer R extends string}` ? { g: [], ng: {}, r: R } :
    R extends `(${infer R extends string}` ? ParseGroup<R> extends { g: infer G extends GroupsArray, ng: infer NG extends NamedGroups, r: infer R extends string } ? { g: G, ng: NG, r: R } : undefined :
    R extends `\\${infer R extends string}` ?
        R extends `u${infer _A extends HexDigits}${infer _B extends HexDigits}${infer R extends string}` ?
            R extends `${infer _A extends HexDigits}${infer _B extends HexDigits}${infer R extends string}` ? { g: [], ng: {}, r: R } :
            undefined :
        R extends `${infer _A extends SpecialRegExpChars}${infer R extends string}` ? { g:[], ng: {}, r: R } :
        R extends `${infer _A extends "n"|"r"|"t"|"s"|"S"|"d"|"D"|"w"|"W"|"v"|"b"}${infer R extends string}` ? { g:[], ng: {}, r: R } :
        R extends `c${infer _A extends Letters}${infer R extends string}` ? { g: [], ng: {}, r: R } :
        R extends `x${infer _A extends HexDigits}${infer _B extends HexDigits}${infer R extends string}` ? { g:[], ng: {}, r: R } :
        R extends `${infer _A extends Digits}${infer R extends string}` ? 
            R extends `${infer _A extends Digits}${infer R extends string}` ? 
                R extends `${infer _A extends Digits}${infer R extends string}` ? { g: [], ng: {}, r: R } :
                { g: [], ng: {}, r: R } :
            { g: [], ng: {}, r: R } :
        undefined :
    undefined;

/* TODO
(?<name>...)
(?=...)
(?!...)
(?<=...)
(?<!...)
[]
a|b
a{3} a{3,} a{3,6} a{3}? a{3,}? a{3,6}?
\k<name>

\u{...}
\p{...} \P{...}
 */

// type test = ValidRegExp<"a(?<a>b)c">;
type test = Parse<"(?<a>())?()">;
/* recursion limit
"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
"(((((((((((((((((((((((())))))))))))))))))))))))"
"\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000"
 */

// https://dev.to/susisu/how-to-create-deep-recursive-types-5fgg

type OptionalGroupsArray<T extends GroupsArray> = T | ArrayWithLength<undefined,T["length"]>;
type ArrayWithLength<T,L extends number, Array extends T[] = []> = [T,...Array]["length"] extends L ? [T,...Array] : ArrayWithLength<T,L,[T,...Array]>;
type And<T extends boolean,U extends boolean> = T|U extends true ? true : T extends false ? false : U extends false ? false : boolean;
type Not<T> = T extends true ? false : T extends false ? true : boolean;
type XOr<T extends boolean,U extends boolean> = T extends true ? Not<U> : T extends false ? U : boolean;
type Or<T extends boolean,U extends boolean> = T extends true ? true : T extends false ? U : boolean;
type If<I,T,F> = I extends true ? T : T extends false ? F : T|F;
type Equals<T,U> = T extends U ? U extends T ? true : false : false;
type StartsWith<T extends string,U extends string> = T extends `${U}${string}` ? true : `${U}${string}` extends T ? boolean : false;
