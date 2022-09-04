import { isFunction } from "@myvue/shared"
import { ReactiveEffect, trackEffects, triggerEffects } from "./effect"


export const computed = (options: Function | {get: () => any, set?: (value: any) => void}) => {
    // let onlyGetter = isFunction(options)
    let getter: Function
    let setter: Function
    if (typeof options === 'function') {
        getter = options
        setter = () => {}
    } else {
        getter = options.get
        setter = options.set
    }

    return new ComputedRefImpl(getter, setter)
}

class ComputedRefImpl {
    public effect: ReactiveEffect
    // 是否为脏数据，如果是脏的那么要执行一次 getter
    // 默认为 true 是因为第一次取值的时候要计算
    public _dirty = true
    public __v_isReadonly = true
    public __v_isRef = true
    public _value: any
    public dep = new Set<ReactiveEffect>()
    constructor(getter: Function, public setter: Function) {
        // 把 getter 方法放到 effect 里，那么就会被收集
        this.effect = new ReactiveEffect(getter, () => {
            // 这个 scheduler 方法用来控制执行 
            // 如果依赖的属性有变动这个方法会被调用
            if (!this._dirty) {
                this._dirty = true
                // 触发更新
                triggerEffects(this.dep)
            }
        })
    }

    // 类中的属性访问器，ES5 就是 Object.defineProperty 实现的
    get value() {
        // 收集依赖
        trackEffects(this.dep)
        if (this._dirty) {  // 如果脏的调用方法更新
            this._dirty = false
            this._value = this.effect.run()
        }
        return this._value
    }

    set value(newValue) {
        this.setter(newValue)
    }
}