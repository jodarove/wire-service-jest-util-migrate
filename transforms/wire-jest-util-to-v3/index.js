/**
 * This re-write tests that use register* from @salesforce/sfdx-lwc-jest according
 * the migration guide (https://github.com/salesforce/wire-service-jest-util/blob/master/docs/migrating-from-version-2.x-to-3.x.md)
 */
module.exports = function(fileInfo, api) {
    const j = api.jscodeshift;

    const root = api.jscodeshift(fileInfo.source);

    const usedRegisterMethods = new Set();
    const removedRegisterMethodsImports = root
        .find(j.ImportDeclaration, (path) => {
            const isWSJU = path.source.value === '@salesforce/sfdx-lwc-jest' ||
                path.source.value === '@salesforce/wire-service-jest-util' ||
                path.source.value === 'wire-service-jest-util'

            if (isWSJU) {
                path.specifiers.forEach((specifier) => {
                    if (specifier.imported.name.startsWith('register')) {
                        usedRegisterMethods.add(specifier.local.name)
                    }
                });
            }

            return isWSJU;
        })
        .remove();

    if (!removedRegisterMethodsImports) {
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