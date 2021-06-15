//
// Recurse through deep objects and apply the visitor to
// anything that isnt another object.
//

const isKeyed = (thing: any): boolean => !Array.isArray(thing) && thing === Object(thing);

export default function visitActionMap(branch: any, visitor: Function, path: string[] = []): any {
    for (let key in branch) {
        let item = branch[key];
        if (typeof item !== 'function' && isKeyed(item)) {
            branch[key] = visitActionMap(item, visitor, path.concat(key));
        } else {
            branch[key] = visitor(item, path.concat(key));
        }
    }
    return branch;
}
