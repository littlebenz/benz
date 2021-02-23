export function base64(value: string | number): number {
    if (typeof value === "string") {
        if (value === "") {
            return 0;
        }
        return value
            .split("")
            .reverse()
            .reduce(function (prev, cur, i) {
                return prev + base64.chars.indexOf(cur) * Math.pow(64, i);
            }, 0);
    }

    return 0;
}

base64.chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

const getChars = function (num: number, res: any): string {
    let mod = num % 64,
        remaining = Math.floor(num / 64),
        chars = base64.chars.charAt(mod) + res;

    if (remaining <= 0) {
        return chars;
    }
    return getChars(remaining, chars);
};
