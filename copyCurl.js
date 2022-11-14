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

  return `\
curl \\
--compressed \\
${attributes.userAgent ? `--user-agent '${attributes.userAgent}'` : ''} \\
${Object.keys(attributes.headers).filter(key => attributes.headers[key]).map(key => `--header '${key}: ${attributes.headers[key]}'`).join(' \\\n')} \\
${attributes.data ? `--data-binary '${JSON.stringify(attributes.data).replace(/'/g, '\'\\\'\'')}'` : ''} \\
'${attributes.url}'\
  `;
};

const copyCurl = async () => {
  const element = document.querySelector('#request-pane-2 > pre > code');
  const curlCommand = translate(element.innerHTML);
  await navigator.clipboard.writeText(curlCommand);
  console.info('Copied.');

  Toastify(toastConfig).showToast();
};

window.onload = async () => {
  document.querySelector('#request-pane-2').addEventListener('click', copyCurl);
  document.querySelector('#app > div > div > div > div > div > div > div > table > tbody').addEventListener('dblclick', copyCurl);
};

;(() => {
  const headerButton = document.createElement('a')
  headerButton.appendChild(document.createTextNode('Copy cURL'));
  headerButton.href = '#'
  const headerList = document.createElement('li')
  headerList.appendChild(headerButton)
  headerList.addEventListener('click', copyCurl);
  document.querySelector('#app > nav > div > div.navbar-collapse.collapse > ul.nav.navbar-nav.navbar-right').appendChild(headerList);

  const buttons = document.querySelector('#app > div > div > div > div > div > div:nth-child(2) > div > div:nth-child(3) > div > div.pull-right > div > div')

  const button = document.createElement('button')
  button.type = 'button'
  button.classList.add(...['foo', 'btn', 'btn-primary'])
  button.innerHTML = 'cURL'
  button.addEventListener('click', copyCurl)
  buttons.prepend(button)

  // Remove unused Binary tab.
  document.querySelector('#request > ul > li:nth-child(4)').remove()
})();