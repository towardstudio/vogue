# Vogue

Simple styleguide generation. 

**Very much a work in progress. I do not recommend you use this. Please refer to the Disclaimer**


## What is this?

Vogue is a CLI which generates a basic pattern library/styleguide. It works in any project, it doesn't care about your file structure.

## What does it do?

It will take a bunch of HTML type components, process them and put them into a file with their CSS and JS. You can then see all your components in one place, which is good for design sign off and development.

## What doesn't it do?

Pretty much anything else. It doesn't show you code snippets for example. Thats what your code editor is for.

## Does it work with [insert my language]

Yes! As long as its Twig, Liquid or Plain ol' HTML. It would be pretty easy to add other languages but I have no cause to use them.

## How does it work?

You tell Vogue where your stuff is using a JSON config file called `.voguefile`. You can give components titles, informative text, and mock data using a `YAML` file with the same name as the component. Vogue will only build out components that have a valid `YAML` file in the same directory as the component.

There's examples in the `demo` directory.

## Installation

```shell
npm i -g vogue -D
```

## Usage

```shell
vogue
```

## Voguefile Settings

### Title
 Your project title.

 ```
	title : STRING | 'Vogue'
```

### Lang
The template language you are using (currently, `twig`, `liquid`, or `html`)

```
	lang : STRING | 'twig'
```

### Template Path
The path to you components (relative to the `.voguefile`)

```
	templatePath : STRING/PATH | './'
```

### Output File

The file that Vogue will create

```
	outputFile: STRING | 'vogue.html'
```

### Output Dir
Where vogue should build the file (e.g. your `public` folder)

```
	outputDir : STRING/PATH | ''
```

### CSS
Path to your CSS file (relative to output Dir)
```
	css : STRING/PATH | ''
```

### JS
Path to your JS file (relative to output Dir)
```
	js : STRING/PATH | ''
```

### Head Scripts
JS to include in the head. You will need to include `<script>` tags. This allows you to reference external JS files

```
	headScript : STRING/JS | ''
```

### Foot Scripts
JS to include in the foot. You will need to include `<script>` tags. This allows you to reference external JS files. (added _before_ the main JS)

```
	footScript : STRING/JS | ''
```

### Font Stack
The `font-family` CSS property value that Vogue should use. e.g. 'Comic Sans' 
```
	fontStack: : STRING/CSS | '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
```

### Foreground Color
The foreground color (e.g. Text). Accepts any valid `CSS` color value

```
	foregroundColor : STRING/CSS | '#333'
```

### Background color
The background color. Accepts any valid `CSS` color value

```
	backgroundColor : STRING/CSS | '#fff'
```

### Highlight Color 
The highlight color (e.g. for links). Accepts any valid `CSS` color value

```
	highlightColor : STRING/CSS | '#345bfb'
```

### Border Color 
The border color (you get the idea)
```
	borderColor : STRING/CSS | '#333'
```

### CSS Override
CSS inserted inside a style block, just in case you want more control over how the vogue file looks.

```
	cssOverride : STRING/CSS | '' 
```

## YAML File
The `YAML` component config file just needs to be named the same as the component (see the demo directory). YOu might need to convert to sapce indentation if you are cool and use tabs usually.

Imagine a button component:

```twig
<{{ el }}{% for attr in attributes %} {{ attr | raw }}{% endfor %} class="btn{% for class in classes %} {{ class }}{% endfor %}">{{ text }}</{{el}}>
```

Each component can have a `title` and `about` value. These are just text. You can also optionally include a `data` object. Use this to pass mock data/props to your component:

```yaml
title: Button
about: This is some text about the thing
data:
  text: This is a button
  attributes:
    - type="button"
    el: button
```

Most components will have several states or types. For example, a `button` component might have `regular`, and `primary` variants and a `disabled` state. You can tell vogue about these using a `types` array:

```yaml
title: Button
about: This is some text about the thing
data:
  text: This is a button
  attributes:
    - type="button"
  el: button
types:
  -
    name: Regular
    about: This is a regular button
  -
    name: Primary
    data:
      classes:
        - primary
  -
    name: Disabled
    data:
      attributes:
        - disabled

```

Each type can have its own `name`, `about`, and `data`. 

Variables on the `type` override variables on the parent data. Any arrays are deep merged, so in the above example the attributes added to the disabled type are `type="button"` and `disabled`.

## Good to know

Vogue uses `Twing` for Twig compilation, `Liquid JS` for liquid compilation. If your particular feature doesn't work, please don't tell me about it.

## To do

- [ ] Make it look purty
- [ ] Tidy up and separate the code
- [ ] Add a navigation
- [ ] Add colours Support
- [ ] Add logo to config
- [ ] Add ordering
- [ ] Support some other languages (e.g. Nunjucks)