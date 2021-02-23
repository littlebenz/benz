interface MapWith<K, V, DefiniteKey extends K> extends Map<K, V> {
    get(k: DefiniteKey): V;
    get(k: K): V | undefined;
}

interface Map<K, V> {
    // Works if there are other known strings.
    has<KnownKeys extends K, CheckedString extends K>(
        this: MapWith<K, V, KnownKeys>,
        key: CheckedString
    ): this is MapWith<K, V, CheckedString | KnownKeys>;

    has<CheckedString extends K>(
        this: Map<K, V>,
        key: CheckedString
    ): this is MapWith<K, V, CheckedString>;
}

interface WeakMap<K, V> {
    // Works if there are other known strings.
    has<KnownKeys extends K, CheckedString extends K>(
        this: MapWith<K, V, KnownKeys>,
        key: CheckedString
    ): this is MapWith<K, V, CheckedString | KnownKeys>;

    has<CheckedString extends K>(
        this: WeakMap<K, V>,
        key: CheckedString
    ): this is MapWith<K, V, CheckedString>;
}

type AtLeastOne<T> = [T, ...T[]];
type AtLeastTwo<T> = [T, T, ...T[]];

interface Math {
    random(upper: number): number;
}
