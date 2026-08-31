// Ersatz für das frühere Vue.prototype.$empty (No-op, z. B. für .catch(empty))
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const empty = () => {}

export const errorHandler = async (res: Response) => {
  if (res.status !== 200) {
    throw await res.text()
  }
  return res
}
