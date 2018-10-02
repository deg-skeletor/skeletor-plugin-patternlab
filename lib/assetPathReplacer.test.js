const assetPathReplacer = require('./assetPathReplacer');

test('Replaces single path', () => {
    const assetPathReplacements = [{
        path: '../../images/',
        replacementPath: '/images/'
    }];

    const fileContents = '<img src="../../images/test.jpg" />';
    const exepectedFileContents = '<img src="/images/test.jpg" />';

    const newFileContents = assetPathReplacer.replaceAssetPaths(fileContents, assetPathReplacements);

    expect(newFileContents).toBe(exepectedFileContents);
});

test('Replaces multiple paths', () => {
    const assetPathReplacements = [{
        path: '../../images/',
        replacementPath: '/images/'
    }];

    const fileContents = `
        <img src="../../images/test.jpg" />
        <img src="../../images/test2.jpg" />`;
    const exepectedFileContents = `
        <img src="/images/test.jpg" />
        <img src="/images/test2.jpg" />`;

    const newFileContents = assetPathReplacer.replaceAssetPaths(fileContents, assetPathReplacements);

    expect(newFileContents).toBe(exepectedFileContents);
});

test('Replaces multiple different paths', () => {
    const assetPathReplacements = [
        {
            path: '../../images/',
            replacementPath: '/images/'
        },
        {
            path: '../../css/',
            replacementPath: '/styles/'
        }
    ];

    const fileContents = `
        <link rel="stylesheet" type="text/css" href="../../css/styles.css">
        <img src="../../images/test.jpg" />
        <img src="../../images/test2.jpg" />`;
    const exepectedFileContents = `
        <link rel="stylesheet" type="text/css" href="/styles/styles.css">
        <img src="/images/test.jpg" />
        <img src="/images/test2.jpg" />`;

    const newFileContents = assetPathReplacer.replaceAssetPaths(fileContents, assetPathReplacements);

    expect(newFileContents).toBe(exepectedFileContents);
});