
// 导出的是个引用而不是值，外面值变了之后这里也会变
export let activeEffect: null | ReactiveEffect = null

/**
 * 响应 Effect 类
 */
class ReactiveEffect {
    // 是否激活，暂时没有使用
    active: boolean = true

    // 以前用 stack 来记录嵌套 Effect 指定当前激活 Effect
    // 通过 parent 来指定更简单
    parent: ReactiveEffect | null = null

    // 需要双向记录，effect 依赖了哪些属性
    deps: Set<ReactiveEffect>[] = []

    // 这里参数上加上 public 那么默认会绑定到 this 上，无需显式赋值
    constructor(public fn: Function) { }

    run() {
        // 如果不激活就不收集依赖，就是直接执行函数
        if (!this.active) {
            this.fn()
        }
        // 依赖搜集
        // 核心就是将当前的 effect 和渲染的属性关联起来
        // 第一次执行之后才绑定 activeEffect
        try {
            this.parent = activeEffect
            activeEffect = this
            return this.fn()
        } finally {
            // 执行完之后就将激活的 effect 设置为自己的父 effect 
            activeEffect = this.parent
            this.parent = null
        }
    }
}

export function effect(fn: Function) {
    const rectiveEffect = new ReactiveEffect(fn)
    // 默认先执行一次
    rectiveEffect.run()
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

    // 判断是否需要加入，其实也可以不判断 Set 自动会排重
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect)
        // 需要记录双向依赖，方便后续清理属性对应的 Effect（暂时还没有用到）
        activeEffect.deps.push(dep)
    }
}

export function trigger(target: any, key: string | Symbol, oldVal: any, newVal: any) {
    const depsMap = targetMap.get(target)
    // 如果这个对象没有被依赖那么什么也不做
    if (!depsMap) return
    const effects = depsMap.get(key)
    if (effects) {
        effects.forEach(effect => {
            // 如果在 effect 中又更新了依赖，那么就会无限循环，所以需要屏蔽一下
            if (activeEffect !== effect) {
                effect.run()
            }
        })
    }
}