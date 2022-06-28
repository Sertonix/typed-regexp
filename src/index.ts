
// --- exported definitions ---
/** Defines all possible flags for regular expressions. */
export type RegExpFlags = "d"|"g"|"i"|"m"|"u"|"y";
/** A tool to create all possible strings that matches the defined flags */
export type RegExpFlagCombos<F extends {[key in RegExpFlags]?: boolean} = {}> = FlagCombosGenerator<{[key in RegExpFlags]: boolean} & F>;

export type TypedRegExpMatchArray<Groups extends string[] = string[], NamedGroups extends { [key: string]: string } = { [key: string]: string }, InputString extends string = string> = {
    index?: number;
    input?: InputString;
    groups: OneNotOptional<NamedGroups>; // never instead to immitate optional
} & ([string,...Groups] /* BUG out of range is only undefiend */ & IntersectedArray<string,TypedRegExpMatchArray<Groups,NamedGroups,InputString>>);

export type TypedRegExpExecArray<Groups extends string[] = string[], NamedGroups extends { [key: string]: string } = { [key: string]: string }, InputString extends string = string> = TypedRegExpMatchArray<Groups,NamedGroups,InputString> & {
    index: number;
    input: InputString;
};

// IDEA regexp parsing -> automatic Groups and NamedGroups generation

export interface TypedRegExp<
    Groups extends string[] = string[],
    NamedGroups extends { [key: string]: string } = { [key: string]: string },
    FlagCombo extends RegExpFlagCombos = RegExpFlagCombos, // IDEA force alphabetical order to reduce computation time
> extends RegExp {
    <Groups extends string[], NamedGroups extends { [key: string]: string }, FlagCombo extends RegExpFlagCombos = RegExpFlagCombos>(pattern: TypedRegExp<Groups,NamedGroups> | string): TypedRegExp<Groups,NamedGroups,FlagCombo>;
    <Groups extends string[], NamedGroups extends { [key: string]: string }, FlagCombo extends RegExpFlagCombos = RegExpFlagCombos>(pattern: string, flags?: FlagCombo): TypedRegExp<Groups,NamedGroups,FlagCombo>;
    
    // TODO only override if existing in the RegExp interface
    exec<InputString extends string, Matches extends boolean = boolean>(string: InputString): If<Matches,TypedRegExpExecArray<Groups,NamedGroups,InputString>,null>;
    // test(string: string): boolean;
    // readonly source: string;
    readonly dotAll: HasFlag<FlagCombo,"d">;
    readonly global: HasFlag<FlagCombo,"g">;
    readonly ignoreCase: HasFlag<FlagCombo,"i">;
    readonly multiline: HasFlag<FlagCombo,"m">;
    readonly unicode: HasFlag<FlagCombo,"u">;
    readonly sticky: HasFlag<FlagCombo,"y">;
    readonly flags: SortFlags<FlagCombo>;
    // lastIndex: number;
    compile< NewGroups extends Groups = Groups, NewNamedGroups extends NamedGroups = NamedGroups, NewFlagCombo extends FlagCombo = FlagCombo >(pattern: string, flags?: NewFlagCombo): this & TypedRegExp<NewGroups,NewNamedGroups,NewFlagCombo>;
    [Symbol.match]<InputString extends string, Matches extends boolean = boolean>(string: InputString): If<Matches,TypedRegExpMatchArray<Groups,NamedGroups,InputString>,null>;
    [Symbol.replace](string: string, replaceValue: string): string; // required
    [Symbol.replace](string: string, replacer: (substring: string, ...args: [...Groups,number,string,...(keyof NamedGroups extends never ? [] : [NamedGroups])]) => string): string;
    // [Symbol.search](string: string): number;
    // [Symbol.split](string: string, limit?: number): string[];
    [Symbol.matchAll]<InputString extends string>(str: InputString): IterableIterator<TypedRegExpMatchArray<Groups,NamedGroups,InputString>>;
}

/** A type constrained regular expression */
export class TypedRegExp<
    Groups extends string[] = string[],
    NamedGroups extends { [key: string]: string } = { [key: string]: string },
    FlagCombo extends RegExpFlagCombos = RegExpFlagCombos,
> extends RegExp {
    constructor(pattern: TypedRegExp<Groups,NamedGroups,FlagCombo> | string);
    constructor(pattern: string, flags?: FlagCombo);
    constructor(pattern: string | TypedRegExp<Groups,NamedGroups,FlagCombo>, flags?: FlagCombo) {
        super(pattern,flags);
    }
}

/** @experimental This class is intended to prevent overloads from the default string methods. */
export interface TypedRegExpString extends Omit<String,"match"|"matchAll"|"replace"|"replaceAll"> /* excludes the old properties to prevent overloads */ {
    // IDEA use return value from the Regexp[Symbol.match] etc. definitions
    // IDEA pass this as string to matches
    match<Groups extends string[], NamedGroups extends { [key: string]: string }, FlagCombo extends RegExpFlagCombos = RegExpFlagCombos, Matches extends boolean = boolean>(regexp: string | TypedRegExp<Groups,NamedGroups,FlagCombo>): If<Matches,TypedRegExpMatchArray<Groups,NamedGroups>,null>;
    matchAll<Groups extends string[], NamedGroups extends { [key: string]: string }, FlagCombo extends RegExpFlagCombos<{g:true}> = RegExpFlagCombos<{g:true}>>(regexp: TypedRegExp<Groups,NamedGroups,FlagCombo>): IterableIterator<TypedRegExpMatchArray<Groups,NamedGroups>>;
    replace<Groups extends string[], NamedGroups extends { [key: string]: string }, FlagCombo extends RegExpFlagCombos = RegExpFlagCombos>(searchValue: string | TypedRegExp<Groups,NamedGroups,FlagCombo>, replacer: (substring: string, ...args: [...Groups,number,string,...(keyof NamedGroups extends never ? [] : [NamedGroups])]) => string): string;
    replaceAll<Groups extends string[], NamedGroups extends { [key: string]: string }, FlagCombo extends RegExpFlagCombos<{g:true}> = RegExpFlagCombos<{g:true}>>(searchValue: string | TypedRegExp<Groups,NamedGroups,FlagCombo>, replacer: (substring: string, ...args: [...Groups,number,string,...(keyof NamedGroups extends never ? [] : [NamedGroups])]) => string): string;
}

declare global {
    interface String {
        // IDEA add a toggle to apply the modifications to the String class directly
        match<Groups extends string[], NamedGroups extends { [key: string]: string }, FlagCombo extends RegExpFlagCombos = RegExpFlagCombos, Matches extends boolean = boolean>(regexp: string | TypedRegExp<Groups,NamedGroups,FlagCombo>): If<Matches,TypedRegExpMatchArray<Groups,NamedGroups>,null>;
        matchAll<Groups extends string[], NamedGroups extends { [key: string]: string }, FlagCombo extends RegExpFlagCombos<{g:true}> = RegExpFlagCombos<{g:true}>>(regexp: TypedRegExp<Groups,NamedGroups,FlagCombo>): IterableIterator<TypedRegExpMatchArray<Groups,NamedGroups>>;
        replace<Groups extends string[], NamedGroups extends { [key: string]: string }, FlagCombo extends RegExpFlagCombos = RegExpFlagCombos>(searchValue: string | TypedRegExp<Groups,NamedGroups,FlagCombo>, replacer: (substring: string, ...args: [...Groups,number,string,...(keyof NamedGroups extends never ? [] : [NamedGroups])]) => string): string;
        replaceAll<Groups extends string[], NamedGroups extends { [key: string]: string }, FlagCombo extends RegExpFlagCombos<{g:true}> = RegExpFlagCombos<{g:true}>>(searchValue: string | TypedRegExp<Groups,NamedGroups,FlagCombo>, replacer: (substring: string, ...args: [...Groups,number,string,...(keyof NamedGroups extends never ? [] : [NamedGroups])]) => string): string;
    }
}

// --- utils ---

/** returns the string keys of an object */
type StringKeysOf<T> = Extract<keyof T,string>;

/** returns an union type of all the non optional keys */
type NonOptionalKeys<T> = { [k in keyof T]-?: undefined extends T[k] ? never : k }[keyof T];

/** returns an union type of all the optional keys */
type OptionalKeys<T> = { [k in keyof T]-?: undefined extends T[k] ? k : never }[keyof T];

/** if condition in types */
type If<I,T,F> = I extends true ? T : T extends false ? F : T|F;

/** returns true if flag is in the flag combo */
type HasFlag<FlagCombo extends RegExpFlagCombos,Flag extends RegExpFlags> = IfIn<FlagCombo,Flag,true,false>;

/** returns the object with at least one property that is not optional */
type OneNotOptional<T> = {[K in keyof T]-?: {[OK in Exclude<OptionalKeys<T>,K>]+?:Exclude<T[OK],undefined>} & {[NOK in NonOptionalKeys<T>|K]-?:Exclude<T[NOK],undefined>} }[keyof T];

/** returns all values of an object */
type ValueOf<T> = T[keyof T];

/** toggle if the object has no true values */
type NoTrueValue<O extends {[k:string]:boolean},T,F=never> = {[k in keyof O as O[k] extends true ? k : never]:k} extends {[k:string]:never} ? T : F;

interface IntersectedArray<T,S> extends Array<T> {
    // modified array that fixes return value from the sort function when the type is used in an intersection
    sort(compareFn?: (a: T, b: T) => number): this & S;
    // elements are defined by the intersected array
    [n: number]: never;
}

// /** converts a union string to all possible combinations including them */
// type StringWith<F extends string> = {[f in F]:`${f}${StringWith<Exclude<F,f>> extends (infer R extends string) ? R : ""}`}[F] | "";

// /** returns true if both objects are equal else false */
// type Equals<T,U> = T extends U ? U extends T ? true : false : false;

/** toggle if a substring is in a string */
type IfIn<String extends string,SubString extends string,True,False=never> = String extends `${string}${SubString}${string}` ? True : False;

/** returns all possible combinations with the given flags */
type FlagCombosGenerator<F extends {[k:string]: boolean}> = ValueOf<{[f in StringKeysOf<F> as F[f] extends false ? never : F[f] extends true ? never : f ]-?: `${f|""}${FlagCombosGenerator<Omit<F,f>> extends infer R ? R extends string ? R : "" : ""}` }> | ValueOf<{[f in StringKeysOf<F> as F[f] extends true ? f : never]-?: `${f}${FlagCombosGenerator<Omit<F,f>> extends infer R ? R extends string ? R : "" : ""}` }> | NoTrueValue<F,"">;

/** sorts the flag alphabetically */
type SortFlags<FlagCombo extends RegExpFlagCombos> = `${IfIn<FlagCombo,"d","d","">}${IfIn<FlagCombo,"g","g","">}${IfIn<FlagCombo,"i","i","">}${IfIn<FlagCombo,"m","m","">}${IfIn<FlagCombo,"u","u","">}${IfIn<FlagCombo,"y","y","">}`;
