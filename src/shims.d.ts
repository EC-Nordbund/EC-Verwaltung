type filename = string

declare module '*.png' {
  const value: filename
  export default value
}
