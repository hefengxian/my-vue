import { ReactiveEffect, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"

/**
 * 如果是对象就变成 Proxy 否则就是原始值
 * 
 * @param value
 * @returns 
 */
function toRective(value: any) {
    return typeof value === 'object' ? reactive(value) : value
}

class RefImpl {
    _value: any // 用来保存实际的值
    __v_isRef = true
    dep = new Set<ReactiveEffect>()  // 用来存放被哪些 effect 依赖了
    constructor(public rawValue: any) {
        this._value = toRective(rawValue)
    }

    get value() {
        // 取值的时候追踪变动
        trackEffects(this.dep)
        return this._value
    }

    set value(newValue: any) {
        // 只有变动了才进行值的更新和 effect 更新
        if (this.rawValue !== newValue) {
            this._value = toRective(newValue)
            // 要在赋值之后调用，这样 effect 里面的取值的时候就可以取到新值了
            triggerEffects(this.dep)
            this.rawValue = newValue
        }
    }
}

class ObjectRefImpl {   // 这个类非常简单，主要是将 .value 属性代理到原对象上去
    constructor(public obj: any, public key: any) {}

    get value() {
        return this.obj[this.key]
    }

    set value(newValue: any) {
        this.obj[this.key] = newValue
    }
}

// 通常用法
export function ref(value: any) {
    return new RefImpl(value)
}


// 下面两个方法都是对应解构属性
export function toRef(object: any, key: any) {
    return new ObjectRefImpl(object, key)
}
export function toRefs(obj: any): any {
    const result = Array.isArray(obj) ? new Array(obj.length) : {}
    for (let key in obj) {
        result[key] = toRef(obj, key)
    }
    return result
}

// 模板里使用 ref 不用写 .value 的实现
export function proxyRefs(obj: any) {
    return new Proxy(obj, {
        get(target, key, receiver) {
            const result = Reflect.get(target, key, receiver)
            // 这里相当于在代理里面把 .value 给点了，但是如果 result 只是个普通属性那么直接返回
            return result.__v_isRef ? result.value : result
        },
        set(target, key, value, receiver) {
            let oldValue = target[key]
            if (oldValue.__v_isRef) {
                oldValue = value
                return true
            }
            return Reflect.set(target, key, value, receiver)
        }
    })
}
