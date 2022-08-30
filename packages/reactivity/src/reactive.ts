import { isObject } from "@myvue/shared"
import { track, trigger } from "./effect"

// WeakMap key 只能是对象
const reactiveMap = new WeakMap()

// 标记是否已经代理过了
export const enum ReactivityFlags {
    IS_REACTIVE = '__v_isReactive',
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
            // 映射属性与 effect 的关系
            track(target, key)
            let res = Reflect.get(target, key, receiver)
            // 深度代理
            if (isObject(res)) {
                res = reactive(res)
            }
            return res
        },
        set(target, key, value, receiver) { 
            const oldVal = target[key]
            const result = Reflect.set(target, key, value, receiver)
            if (oldVal !== value) {     // 如果值有变动才进行更新
                trigger(target, key, oldVal, value)
            }
            return result
        },
    })

    reactiveMap.set(target, proxy)

    return proxy
}

