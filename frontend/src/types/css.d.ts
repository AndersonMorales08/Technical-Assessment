// Si usas Vite, bórralo: `vite/client` ya declara estos módulos.
declare module "*.css";

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
