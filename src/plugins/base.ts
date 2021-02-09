export function defineUseFunction<T>(init: () => T) {
  let data: T = null

  return () => {
    if (!data) {
      data = init()
    }

    return data
  }
}
