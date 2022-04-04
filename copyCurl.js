const translate = (text) => {
  const lines = text.split('\n').filter(Boolean);

  const [method, uri] = lines.shift().split(' ');
  const attributes = {
    method,
    headers: {},
  };

  while (lines.length) {
    const line = lines.shift();
    const [key, value] = line.replace(/\r/g, '').split(': ');
    if (key === 'Host') {
      attributes.url = `https://${value}${uri}`;
    } else if (key === 'User-Agent') {
      attributes.userAgent = value;
    } else if (key === 'Content-Length') {
      // Nothing to do.
    } else if (key === 'Accept') {
      // Nothing to do.
    } else if (key === 'Accept-Encoding') {
      // Nothing to do.
    } else if (key.indexOf('{') === 0) {
      attributes.data = JSON.parse([line, ...lines].join(' '));
      lines.length = 0;
    } else {
      attributes.headers[key] = value;
    }
  }

  return `
curl \\
--compressed \\
${attributes.userAgent ? `--user-agent '${attributes.userAgent}'` : ''} \\
${Object.keys(attributes.headers).filter(key => attributes.headers[key]).map(key => `--header '${key}: ${attributes.headers[key]}'`).join(' \\\n')} \\
${attributes.data ? `--data-binary '${JSON.stringify(attributes.data).replace(/'/g, '\'\\\'\'')}'` : ''} \\
${attributes.url}
  `;
};

const copyCurl = async () => {
  const element = document.querySelector('#request-pane-2 > pre > code');
  const curlCommand = translate(element.innerHTML);
  await navigator.clipboard.writeText(curlCommand);
  console.info('Copied.');
};

window.onload = () => {
  document.querySelector('#request-pane-2').addEventListener('click', async () => copyCurl());
  document.querySelector('#app > div > div > div > div > div.styles__inspectPage__3rnNV > div.styles__section__3dDb2.styles__selector__3hiW9 > div > table > tbody').addEventListener('dblclick', async () => copyCurl());
};
