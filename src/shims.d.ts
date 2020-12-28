declare module 'sw:*' {
  const sw: () => Promise<ServiceWorkerRegistration>
  export default sw
}

declare module 'resource-list:' {
  const value: string[]
  export default value
}
