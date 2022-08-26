import { isObject } from "@myvue/shared"

// WeakMap key 只能是对象
const reactiveMap = new WeakMap()

// 标记是否已经代理过了
const enum ReactivityFlags {
    IS_REACTIVE = '__v_isReactive'
}

export function reactive(target: any) {
    if (!isObject(target)) {
        return
    }

    // 如果已经被代理过了就直接返回
    if (target[ReactivityFlags.IS_REACTIVE]) {
        return target
    }

    if (reactiveMap.has(target)) {
        return reactiveMap.get(target)
    }

    const proxy = new Proxy(target, {
        get(target, key, receiver) {
            // 非常精妙的设计，如何判断一个对象是否已经被代理过
            // 这里并不能简单的使用是否为 Proxy 实例来判断，因为 target 可能是一个
            // 正常用途的 Proxy 并不是 Vue 特殊定义的
            if (key === ReactivityFlags.IS_REACTIVE) {
                return true
            }
            return Reflect.get(target, key, receiver)
        },
        set(target, key, value, receiver) {
            return Reflect.set(target, key, value, receiver)
        },
    })

    reactiveMap.set(target, proxy)

    return proxy
}

