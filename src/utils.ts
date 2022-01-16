import { NAMESPACES, PAGE_TYPES } from "./constants";
import { pageType } from "./global-types";

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

export function isPageType (x: any): boolean {
    return PAGE_TYPES.includes(x);
}

export function pageTypeToNS (pageType: pageType): number | null {
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