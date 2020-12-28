export default () => {
  return {
    name: 'image-loader',
    transform(code, id) {
      const endungen = ['png', 'webp', 'jpg', 'jpeg'];

      const p = id.split('.');
      const end = p[p.length - 1];
      if (endungen.includes(end)) {
        const nameParts = p[p.length - 2].split(/\\|\//);

        // TODO: compile to webP

        const em = this.emitFile({
          type: 'asset',
          name: nameParts[nameParts.length - 1] + '.' + end,
          source: code
        });

        return `export default import.meta.ROLLUP_FILE_URL_${em}`;
      }
    }
  };
}
