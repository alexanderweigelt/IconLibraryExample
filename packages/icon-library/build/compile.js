const {mkdir, readdir, rm, readFile, writeFile} = require('node:fs/promises');
const {join, resolve, basename} = require("node:path");
const sass = require('sass');
const {optimize} = require('svgo');
const svgoConfig = require('../config/svgo.config');
const sassConfig = require('../config/sass.config');

async function emptyDir(dir) {
    let items = [];
    try {
        await readdir(dir, (err, files) => {
            if (err) throw Error(err.message);
            items = files;
        });
    } catch {
        const dirCreation = await mkdir(dir, {
            recursive: true
        });
        return dirCreation;
    }
    return Promise.all(items.map(item => rm(join(dir, item), {recursive: true}, (err) => {
        if (err) {
            console.error(err.message);
        }
    })));
}

async function getSvgData(path) {
    const svgFiles = (await readdir(path)).filter((fileName) => {
        return !fileName.startsWith('.') && fileName.endsWith('.svg');
    });

    const svgData = await Promise.all(
        svgFiles.map(async (fileName) => {
            const dotSplit = fileName.split('.');
            if (dotSplit.length > 2) {
                throw new Error(`svg filename "${fileName}" cannot contain more than one period`);
            }
            const iconName = basename(fileName, '.svg');
            const key = iconName.toLowerCase().replace(/ /g, '');
            const iconFileName = fileName.toLowerCase();
            const title = iconName.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/-/g, ' ').trim().charAt(0).toUpperCase() + iconName.slice(1);
            const srcSvgContent = await readFile(resolve(path, fileName), 'utf8')
            const optimizedSvg = optimize(srcSvgContent, svgoConfig).data;

            return {
                iconName,
                key,
                iconFileName,
                title,
                optimizedSvg
            };
        }),
    );

    return svgData.sort((a, b) => {
        if (a.key < b.key) return -1;
        if (a.key > b.key) return 1;
        return 0;
    });
}

async function createIconFiles(srcSvgData, dist) {
    return await Promise.all(
        srcSvgData.map(async (svgData) => {
            const {optimizedSvg, iconFileName} = svgData;
            return await writeFile(resolve(dist, iconFileName), optimizedSvg);
        }),
    );
}

async function createStyles(src, dist, srcSvgData) {
    const result = (await sass.compileAsync(src, sassConfig)).css;
    return await writeFile(dist, result);
}

async function compile() {
    const rootDir = join(__dirname, '..');
    const paths = {
        svg: {
            src: 'src/icons',
            dist: 'dist/icons',
        },
        sass: {
            src: 'src/styles/main.scss',
            dist: 'dist/styles/main.css',
        },
    };

    try {
        await emptyDir(join(rootDir, paths.svg.dist));
        await emptyDir(join(rootDir, paths.sass.dist.substring(0, paths.sass.dist.lastIndexOf('/'))));
        const srcSvgData = await getSvgData(join(rootDir, paths.svg.src));
        await createIconFiles(srcSvgData, join(rootDir, paths.svg.dist));
        await createStyles(join(rootDir, paths.sass.src), join(rootDir, paths.sass.dist), srcSvgData);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

compile();
