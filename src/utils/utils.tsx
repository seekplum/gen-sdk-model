export function snake2pascal(name: string): string {
    const camelCase = name.replace(/[./_]([a-z])/g, (_, char) => char.toUpperCase());
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}
