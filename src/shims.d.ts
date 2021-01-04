type filename = string

declare module 'resource-list:' {
  const value: filename[]
  export default value
}

declare module '*.png' {
  const value: filename
  export default value
}
