const {mkdir, readdir, rm, readFile, writeFile} = require('node:fs/promises');
const {join, resolve, basename} = require('node:path');
const {SassString, SassMap, compileAsync} = require('sass');
const {optimize} = require('svgo');
const {OrderedMap} = require('immutable');
const {JSDOM} = require("jsdom");
const svgoConfig = require('../config/svgo.config');
const sassConfig = require('../config/sass.config');

/**
 * Class to compile icon library
 */
class IconLibraryCompiler {
    constructor() {
        this.rootDir = join(__dirname, '..');
        this.paths = {
            collection: {
                file: 'collection.generated.json',
                destination: 'lib',
            },
            svg: {
                source: 'src/icons',
                destination: 'lib/icons',
            },
            sass: {
                source: 'src/styles/main.scss',
                destination: 'lib/styles/main.css',
            },
            sprite: {
                file: 'icons.sprite.svg',
                destination: 'lib/icons',
            }
        };
    }

    /**
     * Clean or create destination directories
     * @param directory
     * @returns {Promise<Awaited<void>[]|string>}
     */
    async emptyDirectory(directory) {
        let items = [];

        try {
            items = await readdir(directory, (err, files) => {
                console.log('Files:',files)
                if (err) throw Error(err.message);
            });
        } catch {
            return await mkdir(directory, {
                recursive: true,
            });
        }

        return Promise.all(items.map((item) => rm(join(directory, item), {recursive: true})));
    }

    /**
     * Writes the collected icons to a json file
     * @param svgData
     * @returns {Promise<void>}
     */
    async createIconCollection(svgData) {
        let map = {};
        const dist = join(this.rootDir, this.paths.collection.destination, this.paths.collection.file);
        svgData.map((data) => (map[data.key] = data.optimizedSvg));

        return await writeFile(dist, JSON.stringify(map));
    }

    /**
     * Returns the SVG data from source directory
     * @returns {Promise<Awaited<{optimizedSvg: string, iconName: *, title: string, iconFileName: *, key: *}>[]>}
     */
    async getSvgsData() {
        const path = join(this.rootDir, this.paths.svg.source);
        const svgFiles = (await readdir(path)).filter((fileName) => {
            return !fileName.startsWith('.') && fileName.endsWith('.svg');
        });

        const svgData = await Promise.all(
            svgFiles.map(async (fileName) => {
                if (fileName.split('.').length > 2) {
                    throw new Error(`SVG filename "${fileName}" cannot contain more than one period`);
                }
                const iconName = basename(fileName, '.svg');
                const key = iconName.toLowerCase().replace(/ /g, '');
                const iconFileName = fileName.toLowerCase();
                const title = iconName
                    .replace(/([a-z])([A-Z])/g, '$1 $2')
                    .replace(/-/g, ' ')
                    .trim()
                    .charAt(0)
                    .toUpperCase() + iconName.slice(1);
                const srcSvgContent = await readFile(resolve(path, fileName), 'utf8');
                const optimizedSvg = optimize(srcSvgContent, svgoConfig).data;

                return {
                    iconName,
                    key,
                    iconFileName,
                    title,
                    optimizedSvg,
                };
            })
        );

        return svgData.sort((a, b) => {
            if (a.key < b.key) return -1;
            if (a.key > b.key) return 1;
            return 0;
        });
    }

    /**
     * Builds and stores the optimized SVG files
     * @param svgData
     * @returns {Promise<Awaited<unknown>[]>}
     */
    async createSvgIconFiles(svgData) {
        const dist = join(this.rootDir, this.paths.svg.destination);

        return await Promise.all(
            svgData.map(async (svg) => {
                const {optimizedSvg, iconFileName} = svg;
                return await writeFile(resolve(dist, iconFileName), optimizedSvg);
            })
        );
    }

    /**
     * A SASS compiler
     * @param svgData
     * @returns {Promise<void>}
     */
    async createSassStyles(svgData) {
        const src = join(this.rootDir, this.paths.sass.source);
        const dist = join(this.rootDir, this.paths.sass.destination);
        const iconMap = OrderedMap(svgData.map((svg) => [svg.key, svg.optimizedSvg])).mapEntries(
            ([key, value]) => [new SassString(key), new SassString(value, {quotes: true})]
        );

        const result = (
            await compileAsync(src, {
                ...sassConfig,
                functions: {
                    'getIconsMap()': () => {
                        return new SassMap(iconMap);
                    },
                },
            })
        ).css;

        return await writeFile(dist, result);
    }

    /**
     * Combines all SVG files into one using <symbol> elements
     * @param svgData
     * @returns {Promise<void>}
     */
    async createSvgSprite(svgData) {
        const dist = join(this.rootDir, this.paths.sprite.destination, this.paths.sprite.file);
        const svgTemplate = "<svg style='display: none'></svg>";
        const dom = new JSDOM(svgTemplate, {contentType: 'image/svg+xml'});
        const svg = dom.window.document.querySelector("svg");

        svgData.map((data) => {
            const symbol = dom.window.document.createElement('symbol');
            const title = dom.window.document.createElement('title');
            const element = new JSDOM(data.optimizedSvg, {contentType: 'text/xml'}).window.document.querySelector("svg");
            const paths = element.children;

            symbol.setAttribute('viewBox', element.getAttribute('viewBox'));
            symbol.setAttribute('id', data.key);
            title.append(data.title);
            symbol.append(title);
            for (let path of paths) {
                symbol.append(path);
            }
            svg.append(symbol);
        })

        return await writeFile(dist, dom.serialize());
    }

    /**
     * The main compile method
     * @returns {Promise<void>}
     */
    async compileIcons() {
        try {
            await this.emptyDirectory(join(this.rootDir, this.paths.svg.destination));
            await this.emptyDirectory(join(this.rootDir, this.paths.sass.destination.substring(0, this.paths.sass.destination.lastIndexOf('/'))));
            const svgData = await this.getSvgsData();
            await this.createIconCollection(svgData);
            await this.createSvgIconFiles(svgData);
            await this.createSassStyles(svgData);
            await this.createSvgSprite(svgData);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    }
}

const iconCompiler = new IconLibraryCompiler();
iconCompiler.compileIcons().then(() => console.log("Successful compiled Icon library static assets!"));
