#!/usr/bin/env node

// Node 
const fs = require('fs');
const util = require('util');
const rf = util.promisify(fs.readFile);
// NPM
const YAML = require('yaml');
const { Liquid } = require('liquidjs');
const merge = require('deepmerge');
const {TwingEnvironment, TwingLoaderFilesystem} = require('twing');

// Local
const getFiles = require('./get-files.js');

// config
const CONFIG = JSON.parse(fs.readFileSync('./.voguefile', 'utf8')) || {};
const EXT = CONFIG.lang || 'twig';
const DIR = CONFIG.templatePath || './';
const SCRIPT = CONFIG.js || '';
const OUTPUT_FILE = CONFIG.outputFile || 'vogue.html';
const OUTPUT_DIR = CONFIG.outputDir || '';
const HEAD_SCRIPT = CONFIG.headScript || '';
const FOOT_SCRIPT = CONFIG.footScript || '';
const STYLESHEET = CONFIG.css || '';
const TITLE = CONFIG.title || 'Vogue';
const FONT_STACK = CONFIG.fontStack || `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`
const FOREGROUND_COLOR = CONFIG.foregroundColor || '#333';
const BACKGROUND_COLOR = CONFIG.backgroundColor || '#fff';
const HIGHLIGHT_COLOR = CONFIG.highlightColor || '#345bfb';
const BORDER_COLOR = CONFIG.borderColor || '#333';
const CSS = CONFIG.cssOverride || '';

// TWIG
let loader = new TwingLoaderFilesystem(['./', DIR]);

let twing = new TwingEnvironment(loader);

// LIQUID
const engine = new Liquid({
	root: ['./', DIR], 
	extname: '.liquid'          
});


let ymlFiles;
let componentFiles;

getFiles(DIR, 'yml')
	.then((data) => ymlFiles = data)
	.then(() => {
		componentFiles = ymlFiles.map((file) => {
			return file.replace('.yml', `.${EXT}`)
		})
	})
	.then(() => {
		return processFiles(ymlFiles, componentFiles)
	})
	.then(processed => {
		return processed.map((component) => {
			return `<div class="vogue-component">
				${component.name ? `<h2 class="vogue-h2">${component.name}</h2>` : ''}
				${component.about ? `<p class="vogue-p">${component.about}</p>` : ''}
				${component.types.map(type => {
					return `<div class="vogue-type">
					${type.name ? `<h3 class="vogue-h3">${type.name}</h3>` : ''}
						${type.about ? `<p class="vogue-p">${type.about}</p>` : ''}
						<div class="vogue-component-wrap">
							${type.html}
						</div>
					</div>`
				}).join('\n')}
			</div>`
		}).join('\n');
	})
	.then(html => {
		fs.writeFile(`${OUTPUT_DIR}/${OUTPUT_FILE}`, fillHTML(html), function (err) {
			if (err) return console.log(err);
			console.log('vogue done');
		});
	});

async function processFiles(dataFiles, componentFiles) {

	const components = dataFiles.map(async (filePath, i) => {

		const file = fs.readFileSync(filePath, 'utf8')
		const yml = YAML.parse(file);
		const data = yml.data;
		const componentName = yml.title;
		const componentAbout = yml.about

		let typeArray = yml.types || [{}];

		const types = typeArray.map(async type => {

			let mergedData = merge(data, type.data || {});
			let component = componentFiles[i];

			
			switch (EXT) {
				case 'twig':

					return {
						name: type.name || '',
						about: type.about || '', 
						html: await processTwigFile(component, mergedData)
					}
					
					break;

				case 'liquid':

					return {
						name: type.name || '',
						about: type.about || '', 
						html: await processLiquidFile(component, mergedData)
					}

					break;
			
				default:
					return {
						name: type.name || '',
						about: type.about || '', 
						html: await processHTMLFile(component)
					}
					break;
			}

		});

		return {
			name: componentName,
			about: componentAbout,
			types: await Promise.all(types)
		}

	});

	return await Promise.all(components);

}

function fillHTML(vogueHTML) {
	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>${TITLE}</title>
		${HEAD_SCRIPT}
		<link rel="stylesheet" href="${STYLESHEET}">

		<style>
		html { box-sizing: border-box }
*, *:before, *:after { box-sizing: inherit }
html, body, h1, h2, h3, h4, h5, h6, p, ol, ul, li, dl, dt, dd, blockquote, address { margin: 0; padding: 0 }

:root {
	--font-stack: ${FONT_STACK};
	--foreground-color: ${FOREGROUND_COLOR};
	--background-color: ${BACKGROUND_COLOR};
	--highlight-color: ${HIGHLIGHT_COLOR};
	--border-color: ${BORDER_COLOR};
}		
html {
	font-family: var(--font-stack);
	background: var(--background-color);
	color: var(--foreground-color);
}
.vogue-body {
	max-width: 90em;
	margin: 0 auto;
	padding: 0 2em;
}

.vogue-h1 + *, 
.vogue-h2 + *, 
.vogue-h3 + * {
	margin-top: .5rem;
} 

.vogue-h3 {
	opacity: .75;
}
.vogue-header {
	margin: 2em 0;
}
.vogue-component {
	margin: 2em 0;
}
.vogue-component + .vogue-component {
	border-top: 1px solid var(--border-color);
	padding-top: 2em;
}

.vogue-type {
	margin: 2em 0;
}

.vogue-component-wrap {
	margin-top: 1em;
}

.vogue-footer {
	margin: 2em 0;
}
${CSS}
		</style>
	</head>
	<body class="vogue-body">
	
	<header class="vogue-header">
		<h1 class="vogue-h1">${TITLE}</h1>
	</header>	
	<main>
	${vogueHTML}
	</main>
	<footer class="vogue-footer">

	<p><small>&copy; ${new Date().getFullYear()}</small></p>

	</footer>
	
		${FOOT_SCRIPT}

	<script src="${SCRIPT}"></script>
	</body>
	</html>
	`
}

async function processTwigFile(file, data) {
	return twing.render(file, data)
		.then((html) => {
			return html;
		})
		.catch((err) => {
			console.log(err);
		})
}

function processLiquidFile(file, data) {
	return engine.renderFile(file, data)   
		.then((html) => {
			return html;
		})
		.catch((err) => {
			console.log(err);
		})
}

function processHTMLFile(file) {
	return rf(file)
		.then((html) => {
			return html;
		})
		.catch((err) => {
			console.log(err);
		})
}
