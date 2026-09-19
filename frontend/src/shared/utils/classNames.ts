type ClassValue = string | false | null | undefined;

/** Une clases CSS ignorando los valores vacíos: classNames("a", cond && "b"). */
export const classNames = (...classes: ClassValue[]): string =>
  classes.filter(Boolean).join(" ");
