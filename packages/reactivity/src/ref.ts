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

export function ref(value: any) {
    return new RefImpl(value)
}

