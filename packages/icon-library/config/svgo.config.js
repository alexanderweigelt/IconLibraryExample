module.exports = {
    multipass: true,
    plugins: [
        'preset-default',
        'removeDimensions',
        'convertStyleToAttrs',
        {
            name: 'removeAttrs',
            params: {
                attrs: ['path:(fill|stroke)', 'fill', 'data.*'],
            },
        },
        {
            name: 'sortAttrs',
            params: {
                xmlnsOrder: 'alphabetical',
            },
        },
    ],
};
