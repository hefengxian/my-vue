
// 导出的是个引用而不是值，外面值变了之后这里也会变
export let activeEffect: null | ReactiveEffect = null

function cleanupEffect(effect: ReactiveEffect) {
    const { deps } = effect
    // 这里为什么要循环的清理，这里的目的不是清理 deps 这个数组
    // 而是要清理里面的 Set，而且是各个的属性对应的都要清理
    // 另外需要注意的是 Set 特性，不能边加边清理，会陷入死循环，而
    // 数组不会，所以后面在收集的时候会弄一个拷贝
    for (let set of deps) {
        // 这里由于持有的是 Set 的引用，targetMap 里也持有了
        // 这里删掉了那么那边也没有了，而不是直接删除 deps 数组持有的引用
        set.delete(effect)
    }
    // JS 中把数组的 length 设置为 0 会清空数组
    // 所以下面的代码可以替换成 `effect.deps.length = 0`
    effect.deps = []
}

/**
 * 响应 Effect 类
 */
export class ReactiveEffect {
    // 是否激活，暂时没有使用
    active: boolean = true

    // 以前用 stack 来记录嵌套 Effect 指定当前激活 Effect
    // 通过 parent 来指定更简单
    parent: ReactiveEffect | null = null

    // 需要双向记录，effect 依赖了哪些属性
    deps: Set<ReactiveEffect>[] = []

    // 这里参数上加上 public 那么默认会绑定到 this 上，无需显式赋值
    constructor(public fn: Function, public schuduler?: Function) { }

    run() {
        // 如果不激活就不收集依赖，就是直接执行函数
        if (!this.active) {
            return this.fn()
        }
        // 依赖搜集
        // 核心就是将当前的 effect 和渲染的属性关联起来
        // 第一次执行之后才绑定 activeEffect
        try {
            this.parent = activeEffect
            activeEffect = this
            // 执行函数之前，清理掉之前收集的依赖，然后重新收集
            cleanupEffect(this)
            return this.fn()
        } finally {
            // 执行完之后就将激活的 effect 设置为自己的父 effect 
            activeEffect = this.parent
            // this.parent = null
        }
    }

    /**
     * 停止响应
     */
    stop() {
        if (this.active) {
            this.active = false
            // 清理自己已经注册的依赖
            cleanupEffect(this)
        }
    }
}

export function effect(fn: Function, options?: {scheduler: Function}) {
    const rectiveEffect = new ReactiveEffect(fn, options?.scheduler)
    // 默认先执行一次
    rectiveEffect.run()

    // 这里要修改一下 this 的指向，不然会直接指向全局
    // run() 方法里使用 this 的地方就会报错
    const runner: {(): any, effect: ReactiveEffect} = rectiveEffect.run.bind(rectiveEffect)
    // 给 runner 添加 effect 属性，指向当前的 ReactiveEffect
    runner.effect = rectiveEffect
    return runner
}

const targetMap = new WeakMap<object, Map<string | Symbol, Set<ReactiveEffect>>>()
export function track(target: object, key: string | Symbol) {
    // 存储的数据结构是
    // WeakMap {原对象: Map({key: Set(effect)})}

    if (!activeEffect) return   // 如果是默认的第一次执行，不需要处理

    // 获取 target 对应的 Map
    let depsMap: Map<string | Symbol, Set<ReactiveEffect>> = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map<string | Symbol, Set<ReactiveEffect>>()
        targetMap.set(target, depsMap)
    }

    // 获取 key 对应的 Set
    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set<ReactiveEffect>()
        depsMap.set(key, dep)
    }

    trackEffects(dep)
}


export const trackEffects = (dep: Set<ReactiveEffect>) => {
    // 判断是否需要加入，其实也可以不判断 Set 自动会排重
    if (activeEffect && !dep.has(activeEffect)) {
        dep.add(activeEffect)
        // 需要记录双向依赖，方便后续清理属性对应的 Effect
        activeEffect.deps.push(dep)
    }
}

export function trigger(target: any, key: string | Symbol, oldVal: any, newVal: any) {
    const depsMap = targetMap.get(target)
    // 如果这个对象没有被依赖那么什么也不做
    if (!depsMap) return
    let effects = depsMap.get(key)

    if (effects) {
        triggerEffects(effects)
    }
}

/**
 * 触发更新
 * 
 * @param effects 
 */
export const triggerEffects = (effects: Set<ReactiveEffect>) => {
    // 由于 Set 边设置边删除（cleanupEffect）会死循环，做一个拷贝
    effects = new Set(effects)
    effects.forEach(effect => {
        // 如果在 effect 中又更新了依赖，那么就会无限循环，所以需要屏蔽一下
        if (activeEffect !== effect) {
            if (effect.schuduler) {
                effect.schuduler()
            } else {
                effect.run()
            }
    }
})
}