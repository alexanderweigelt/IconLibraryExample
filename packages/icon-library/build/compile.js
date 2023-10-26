const {mkdir, readdir, rm, readFile, writeFile} = require('node:fs/promises');
const {join, resolve, basename} = require('node:path');
const {SassString, SassMap, compileAsync} = require('sass');
const {optimize} = require('svgo');
const {OrderedMap} = require('immutable');
const svgoConfig = require('../config/svgo.config');
const sassConfig = require('../config/sass.config');

class IconCompiler {
    constructor() {
        this.rootDir = join(__dirname, '..');
        this.paths = {
            svg: {
                source: 'src/icons',
                destination: 'dist/icons',
            },
            sass: {
                source: 'src/styles/main.scss',
                destination: 'dist/styles/main.css',
            },
        };
    }

    async emptyDirectory(directory) {
        let items = [];
        try {
            await readdir(directory, (err, files) => {
                if (err) throw Error(err.message);
                items = files;
            });
        } catch {
            return await mkdir(directory, {
                recursive: true,
            });
        }
        return Promise.all(items.map((item) => rm(join(directory, item), {recursive: true})));
    }

    async getSvgsData(path) {
        const svgFiles = (await readdir(path)).filter((fileName) => {
            return !fileName.startsWith('.') && fileName.endsWith('.svg');
        });

        const svgData = await Promise.all(
            svgFiles.map(async (fileName) => {
                const dotSplit = fileName.split('.');
                if (dotSplit.length > 2) {
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

    async createSvgIconFiles(svgData, destination) {
        return await Promise.all(
            svgData.map(async (svg) => {
                const {optimizedSvg, iconFileName} = svg;
                return await writeFile(resolve(destination, iconFileName), optimizedSvg);
            })
        );
    }

    async createSassStyles(sassSource, sassDestination, svgData) {
        const iconMap = OrderedMap(svgData.map((svg) => [svg.key, svg.optimizedSvg])).mapEntries(
            ([key, value]) => [new SassString(key), new SassString(value, {quotes: true})]
        );

        const result = (
            await compileAsync(sassSource, {
                ...sassConfig,
                functions: {
                    'getIconsMap()': () => {
                        return new SassMap(iconMap);
                    },
                },
            })
        ).css;

        return await writeFile(sassDestination, result);
    }

    async compileIcons() {
        try {
            await this.emptyDirectory(join(this.rootDir, this.paths.svg.destination));
            await this.emptyDirectory(join(this.rootDir, this.paths.sass.destination.substring(0, this.paths.sass.destination.lastIndexOf('/'))));
            const svgData = await this.getSvgsData(join(this.rootDir, this.paths.svg.source));
            await this.createSvgIconFiles(svgData, join(this.rootDir, this.paths.svg.destination));
            await this.createSassStyles(
                join(this.rootDir, this.paths.sass.source),
                join(this.rootDir, this.paths.sass.destination),
                svgData
            );
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    }
}

const iconCompiler = new IconCompiler();
iconCompiler.compileIcons().then(() => console.log("Successful compiled!"));
