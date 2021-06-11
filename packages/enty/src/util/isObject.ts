export default function isPlainObject(o: Object): boolean {
    var ctor, prot;

    if (isObjectObject(o) === false) return false;

    // If has modified constructor
    ctor = o.constructor;
    if (typeof ctor !== 'function') return false;

    prot = ctor.prototype;

    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
    }

    // Most likely a plain Object
    return true;
}

function isObjectObject(val: Object): boolean {
    const isObjectLike = val != null && typeof val === 'object' && Array.isArray(val) === false;
    return isObjectLike && Object.prototype.toString.call(val) === '[object Object]';
}
