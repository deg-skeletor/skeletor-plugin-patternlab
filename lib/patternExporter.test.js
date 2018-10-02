const path = require('path');
const globby = require('globby');
const fse = require('fs-extra');
const jsBeautify = require('js-beautify');
const patternExporter = require('./patternExporter');

jest.mock('path');

const patternLabConfig = {
    "outputFileSuffixes": {
        "rendered": ".rendered",
        "rawTemplate": "",
        "markupOnly": ".markup-only"
    },
	"paths" : {
		"source" : {			
			"patterns" : "./source/_patterns/"
		},
		"public" : {
			"patterns" : "./public/patterns/"
		}
	}
};

const logger = {
	info: () => {},
	warn: () => {},
	error: () => {}
};

beforeEach(() => {
    jest.clearAllMocks();

    path.__reset();
});

describe('When exportPatterns() is invoked', () => {
	const patternFileContents = `
	<html>
		<head>
			<title>{{ title }}</title>

			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<meta http-equiv="x-ua-compatible" content="ie=edge">

			<!-- Begin Pattern Lab Specific Styles -->
			<link rel="stylesheet" href="../../css/styleguide.css?{{ cacheBuster }}">
			<!-- End Pattern Lab Specific Styles -->

			<link rel="stylesheet" href="../../css/global.css?{{ cacheBuster }}">

			<!-- Begin Pattern Lab (Required for Pattern Lab to run properly) -->
			<meta http-equiv="cache-control" content="max-age=0" />
			<meta http-equiv="cache-control" content="no-cache" />
			<meta http-equiv="expires" content="0" />
			<meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
			<meta http-equiv="pragma" content="no-cache" />

			<link rel="stylesheet" href="../../styleguide/css/styleguide.min.css?1534365989494" media="all">
			<link rel="stylesheet" href="../../styleguide/css/prism-typeahead.min.css?1534365989494" media="all" />
			<!-- End Pattern Lab -->
		</head>
        <body>
        <p>Hello</p>
		<!-- Begin Pattern Lab JS -->
		<script type="text/json" id="sg-pattern-data-footer" class="sg-pattern-data">
		{"cssEnabled":false,"patternLineageExists":true,"patternLineages":[{"lineagePattern":"templates-homepage","lineagePath":"../../patterns/03-templates-00-homepage/03-templates-00-homepage.rendered.html"}],"lineage":[{"lineagePattern":"templates-homepage","lineagePath":"../../patterns/03-templates-00-homepage/03-templates-00-homepage.rendered.html"}],"patternLineageRExists":false,"patternLineagesR":[],"lineageR":[],"patternLineageEExists":true,"patternDesc":"","patternBreadcrumb":{"patternType":"pages"},"patternExtension":"mustache","patternName":"Homepage","patternPartial":"pages-homepage","patternState":"","patternEngineName":"mustache","extraOutput":{}}
	  	</script>
		<!-- End Pattern Lab JS -->
		</body>
    </html>`;
    
    const patternMarkupOnlyFileContents = `<p>Hello</p>`;

	const htmlFileContents = `
	<html>
		<head>
			<title>{{ title }}</title>

			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<meta http-equiv="x-ua-compatible" content="ie=edge">

			

			<link rel="stylesheet" href="../../css/global.css?{{ cacheBuster }}">

			
		</head>
        <body>
        <p>Hello</p>
		
		</body>
    </html>`;
    
    const htmlNoHeadFootFileContents = `<p>Hello</p>`;

    const patternExportGroup = [
        {
            patterns: 'components/*',
            dest: './dist/patterns/',
            includeHeadFoot: true
        }
    ];

	const exportConfig = {
		patternGroups: patternExportGroup
	};

    test('it returns true when everything goes right', async () => {
        const globPattern = patternLabConfig.paths.public.patterns + '*/??-components-*';

        globby.__setPatternPaths({
			[globPattern]: []
		});

        const result = await patternExporter.exportPatterns(patternLabConfig, exportConfig, logger);
        expect(result).toBe(true);
    });

    test('it returns false when something goes wrong', async () => {
        const globPattern = patternLabConfig.paths.public.patterns + '*/??-components-*';

        const sourceFilepath = 'dist/patterns/00-components-00-test/00-components-00-test.rendered.html';
		
		globby.__setPatternPaths({
			[globPattern]: [
				sourceFilepath
			]
		});

        const result = await patternExporter.exportPatterns(patternLabConfig, exportConfig, logger);
        expect(result).toBe(false);
    });

    test('no patterns are found and nothing is exported', async () => {
        const globPattern = patternLabConfig.paths.public.patterns + '*/??-components-*';

        globby.__setPatternPaths({
			[globPattern]: []
		});

        await patternExporter.exportPatterns(patternLabConfig, exportConfig, logger);
        expect(fse.outputFile).toHaveBeenCalledTimes(0);
    });

	test('two patterns are found and are exported', async () => {
		const globPattern = patternLabConfig.paths.public.patterns + '*/??-components-*';
	
		const sourceFilepaths = {
			'test': 'dist/patterns/00-components-00-test/00-components-00-test.rendered.html',
			'test2': 'dist/patterns/00-components-01-test2/00-components-01-test2.rendered.html'
		};

		const destFilepaths = {
			'test': './dist/patterns/components/test.html',
			'test2': './dist/patterns/components/test2.html'
		};
		
		globby.__setPatternPaths({
			[globPattern]: [
				sourceFilepaths.test,
				sourceFilepaths.test2
			]
		});

		fse.__setFileContents(sourceFilepaths.test, patternFileContents);
		fse.__setFileContents(sourceFilepaths.test2, patternFileContents);

		await patternExporter.exportPatterns(patternLabConfig, exportConfig, logger);
		expect(fse.outputFile).toHaveBeenCalledTimes(2);
		expect(fse.outputFile).toHaveBeenCalledWith(destFilepaths.test2, htmlFileContents);
        expect(fse.outputFile).toHaveBeenCalledWith(destFilepaths.test, htmlFileContents);
    });
    
    test('a pattern with a pattern subtype is found and is exported to the correct subdirectory', async () => {
		const globPattern = patternLabConfig.paths.public.patterns + '*/??-components-*';
	
		const sourceFilepaths = {
			'test': 'dist/patterns/00-components-00-subtype-00-test/00-components-00-subtype-00-test.rendered.html'
		};

		const destFilepaths = {
			'test': './dist/patterns/components/subtype/test.html'
		};
		
		globby.__setPatternPaths({
			[globPattern]: [
				sourceFilepaths.test
			]
		});

		fse.__setFileContents(sourceFilepaths.test, patternFileContents);

		await patternExporter.exportPatterns(patternLabConfig, exportConfig, logger);
		expect(fse.outputFile).toHaveBeenCalledTimes(1);
		expect(fse.outputFile).toHaveBeenCalledWith(destFilepaths.test, expect.any(String));
    });
    
    test('a pattern is exported without head and foot content', async () => {		
		const exportConfigMarkupOnly = {
			patternGroups: [
				{
					patterns: 'components/*',
					dest: './dist/patterns/',
					includeHeadFoot: false
				}
			]
		}

		const globPattern = patternLabConfig.paths.public.patterns + '*/??-components-*';
	
		const sourceFilepath = 'dist/patterns/00-components-00-subtype-00-test/00-components-00-subtype-_test.rendered.html';
		
		globby.__setPatternPaths({
			[globPattern]: [
                sourceFilepath
			]
		});

		await patternExporter.exportPatterns(patternLabConfig, exportConfigMarkupOnly, logger);
		expect(fse.readFile).not.toHaveBeenCalled();
    });
    
    test('a hidden pattern is not exported', async () => {
        const exportConfigMarkupOnly = {
			patternGroups: [
				{
					patterns: 'components/*',
					dest: './dist/patterns/',
					includeHeadFoot: false
				}
			]
		};

		const globPattern = patternLabConfig.paths.public.patterns + '*/??-components-*';
	
		const sourceFilepaths = {
            'patternFull': 'dist/patterns/00-components-00-subtype-00-test/00-components-00-subtype-00-test.rendered.html',
			'patternMarkupOnly': 'dist/patterns/00-components-00-subtype-00-test/00-components-00-subtype-00-test.markup-only.html'
		};

		const destFilepaths = {
			'test': './dist/patterns/components/subtype/test.html'
		};
		
		globby.__setPatternPaths({
			[globPattern]: [
                sourceFilepaths.patternFull,
                sourceFilepaths.patternMarkupOnly
			]
		});

		fse.__setFileContents(sourceFilepaths.patternMarkupOnly, patternMarkupOnlyFileContents);

		await patternExporter.exportPatterns(patternLabConfig, exportConfigMarkupOnly, logger);
		expect(fse.outputFile).toHaveBeenCalledTimes(1);
		expect(fse.outputFile).toHaveBeenCalledWith(destFilepaths.test, htmlNoHeadFootFileContents);
	});

	test('a pattern is exported with replaced asset paths', async () => {		
		const exportConfig = {
			patternGroups: [
				{
					patterns: 'components/*',
					dest: './dist/patterns/',
					includeHeadFoot: true
				}
			],
			assetPathReplacements: [
				{
					path: '../../css/',
					replacementPath: '/css/'
				}
			]
		}

		const globPattern = patternLabConfig.paths.public.patterns + '*/??-components-*';

		const sourceFilepath = 'dist/patterns/00-components-00-test/00-components-00-test.rendered.html';
		const destFilepath = './dist/patterns/components/test.html';
		
		globby.__setPatternPaths({
			[globPattern]: [
				sourceFilepath
			]
		});

		fse.__setFileContents(sourceFilepath, patternFileContents);

		const replacedHtmlFileContents = htmlFileContents.replace('../../css/', '/css/');

		await patternExporter.exportPatterns(patternLabConfig, exportConfig, logger);
		expect(fse.outputFile).toHaveBeenCalledWith(destFilepath, replacedHtmlFileContents);
    });
});