const punycode = require('punycode');

/**
 * Parse public suffix list and invoke callback on each rule.
 */
module.exports = (body, cb) => {
  const beginPrivateDomains = '// ===begin private domains===';
  let isIcann = true;

  // Iterate on lines and extract public suffix rules
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i].trim().toLowerCase();

    // Ignore comments
    if (line.length === 0 || line.startsWith('//')) {
      if (line.startsWith(beginPrivateDomains)) {
        isIcann = false;
      }

      continue;
    }

    let isException = false;
    let isWildcard = false;
    let isNormal = false;

    // Select correct section to insert the rule
    if (line[0] === '!') {
      isException = true;
      line = line.slice(1);
    } else if (line.startsWith('*.')) {
      isWildcard = true;
    } else {
      isNormal = true;
    }

    // Specification says that we should only consider the content of a line up
    // to the first whitespace encountered.
    const spaceIndex = line.indexOf(' ');
    if (spaceIndex !== -1) {
      line = line.substr(0, spaceIndex);
    }

    // If suffix is not ascii, we index the suffix twice so that we support IDNA
    // labels as well. This allows to not have to perform the conversion at
    // runtime.
    const encoded = punycode.toASCII(line);
    if (line !== encoded) {
      cb({
        rule: encoded,
        isException,
        isWildcard,
        isNormal,
        isIcann,
      });
    }

    cb({
      rule: line,
      isException,
      isWildcard,
      isNormal,
      isIcann,
    });
  }
};
