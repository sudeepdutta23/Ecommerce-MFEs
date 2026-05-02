// Type declarations for Module Federation remotes
declare module 'productsMfe/App' {
  const mountProducts: (el: HTMLElement | string) => (() => void)
  export default mountProducts
}

declare module 'cartMfe/CartApp' {
  const mountCart: (el: HTMLElement | string) => (() => void)
  export default mountCart
}
