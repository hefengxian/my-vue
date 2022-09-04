export function isObject(value: any) {
    return typeof value === 'object' && value != null
}

export function isFunction(value: any) {
    return typeof value === 'function'
}

export const isArray = Array.isArray

export const isString = (value: any) => {
    return typeof value === 'string'
}

export const assign = Object.assign

