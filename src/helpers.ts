export const errorHandler = async (res: Response) => {
  if (res.status !== 200) {
    throw await res.text()
  }
  return res
}
