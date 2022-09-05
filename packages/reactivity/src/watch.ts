import { ReactiveEffect } from "./effect"

export const watch = (obj: Function | object, cb: Function) => {
    // watch 也是一个 effect，Vue3 里这个 effect 是核心
    let fn: Function
    let newVal: any
    let oldVal: any
    if (typeof obj === 'function') {
        fn = obj
    } else {
        // 为了 effect 能追踪 obj 中的属性，需要把对象里的属性访问一遍
        // 这个方法要返回原始值，因为下面的 oldVal & newVal 会用到
        fn = () => traversal(obj)
    }
    let cleanup: Function
    const onCleanup = (fn: Function) => {
        cleanup = fn
    }
    const effect = new ReactiveEffect(fn, () => {
        // 这里是上一次变动的清理被本次执行
        if (cleanup) {
            cleanup()
        }
        // effect 的调度器，在依赖的属性变动之后会调用
        // 这里不能直接调用 cb 应该还要收集 newVal & oldVal
        // 为了得到新的值，在依赖变动之后再次手工执行一下 fn
        newVal = effect.run()
        cb(newVal, oldVal, onCleanup)
        // 这里需要注意，要更新 oldVal 为下次变动使用
        oldVal = newVal
    })

    // 第一次执行，这里执行的是我们传入的 fn 所以相当于旧的值
    oldVal = effect.run()
}


function traversal(value: object, set = new Set()) {
    // 使用递归进行属性遍历
    if (typeof value !== 'object') return

    // 防止循环引用
    if (set.has(value)) return
    set.add(value)

    // 遍历属性
    for (let key in value) {
        traversal(value[key], set)
    }

    // 这里只是单纯的返回原对象
    return value
}