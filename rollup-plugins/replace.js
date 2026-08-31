import definePlugin from './helper'

export default () => {
  return definePlugin({
    name: 'replace',

    transform(code, id) {
      return code
        .replace(/process\.env\.NODE_ENV/g, JSON.stringify(process.env.NODE_ENV))
        .replace(/__API_BASE__/g, JSON.stringify(process.env.API_BASE || 'https://api.ec-nordbund.de'));
    }
  })
}
