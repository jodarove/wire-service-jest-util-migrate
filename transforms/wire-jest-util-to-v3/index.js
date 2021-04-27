/**
 * This re-write tests that use register* from @salesforce/sfdx-lwc-jest according
 * the migration guide (https://github.com/salesforce/wire-service-jest-util/blob/master/docs/migrating-from-version-2.x-to-3.x.md)
 */
const WireServiceJestUtilAliases = new Set([
    '@salesforce/sfdx-lwc-jest',
    '@salesforce/wire-service-jest-util',
    'wire-service-jest-util',
]);

module.exports = function(fileInfo, api) {
    const j = api.jscodeshift;

    const root = api.jscodeshift(fileInfo.source);

    const importsFromWSJU = root
        .find(j.ImportDeclaration, ({ source: { value }}) => WireServiceJestUtilAliases.has(value));

    const usedRegisterMethods = new Set(
        importsFromWSJU.nodes().reduce((acc, { specifiers }) => {
            acc.push(...specifiers.map(({ local: { name }}) => name));

            return acc;
        }, [])
    );

    // We can safely remove imports from @salesforce/wire-service-jest-util because in v2
    // the only exported methods are register*
    const removedImportsFromWSJU = importsFromWSJU.remove();

    if (!removedImportsFromWSJU) {
        // no transformations needed
        return null;
    }

    // Find variable declarations using register*
    const variableNames = new Map();
    const testAdapterVariableDeclaration = root
        .find(j.VariableDeclarator, (path) => {
            const { init } = path
            if (init && init.type === 'CallExpression' && init.callee.type === 'Identifier' && usedRegisterMethods.has(init.callee.name)) {
                variableNames.set(path.id.name, init.arguments[0].name);
                return true;
            }
        });

    variableNames.forEach((newName, oldName) => {
        root.findVariableDeclarators(oldName)
            .renameTo(newName);
    });

    testAdapterVariableDeclaration.remove();

    // remove any remaining call to register methods ( like registerTestWireAdapter(Foo) )
    root
        .find(j.CallExpression, ({ callee }) => callee.type === 'Identifier' && usedRegisterMethods.has(callee.name))
        .remove();

    return root
        .toSource();
}