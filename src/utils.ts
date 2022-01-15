import { NAMESPACES } from "./constants";
import { namespace, pageType } from "./global-types";

export function isNum ( x: any ): boolean {
	return !isNaN(Number(x));
}

export function isNamespace (x: any): boolean {
    if (typeof x === 'object') {
        return false;
    }
    if (isNum(x)) {
        const numX = Number(x);
        return Object.values(NAMESPACES).includes(numX);
    }
    if (typeof x !== 'string') {
        console.error('isNamespace: unexpected type of ' + x + '; type: ' + typeof x);
        return false;
    }
    return NAMESPACES[x] !== undefined;
}

export function pageTypeToNS (pageType: pageType): namespace | null {
    switch (pageType) {
        case 'file':
            return NAMESPACES['File'];
        case 'page':
            return NAMESPACES['Main'];
        case 'subcat':
            return NAMESPACES['Category'];
        case 'template':
            return NAMESPACES['Template'];
        default:
            return null;
    }
}