import { describe, test, expect } from '@jest/globals'
import { effect } from './effect'
import { reactive } from './reactive'

describe('Test effect', () => {
    test('Should run one time by default', () => {
        const state = reactive({
            name: 'Frank',
            age: 30,
        })
        effect(() => {
            expect(state.age).toBe(30)
        })
    })

    test('Should rerun when state change', () => {
        const state = reactive({
            name: 'Frank',
            age: 30,
        })
        let age = 0
        effect(() => {
            age = state.age
        })
        expect(age).toBe(30)
        state.age = 45
        expect(age).toBe(45)
    })

    test('Should not run when state update if effect not use it', () => {
        const state = reactive({
            name: 'Frank',
            age: 30,
        })
        let counter = 0
        effect(() => {
            counter++
        })

        state.age++
        expect(counter).toBe(1)

        state.name = 'Bob'
        expect(counter).toBe(1)
    })

    test('Should not run infinit', () => {
        const state = reactive({
            num: 30,
        })

        let counter = 0
        effect(() => {
            counter++
            state.num = Math.random()
        })

        state.num = 20
        expect(counter).toBe(1)
    })

    test('Should not run when change name', () => {
        const state = reactive({
            name: 'Frank',
            age: 30,
            flag: true,
        })

        let counter = 0
        let val: number | string
        effect(() => {
            counter++
            val = state.flag ? state.name : state.age
        })
        expect(val).toBe('Frank')
        expect(counter).toBe(1)
        state.flag = false
        expect(val).toBe(30)
        expect(counter).toBe(2)

        // 因为 flag 已经是 false 了，此时 name 变化 effect 不应该被执行
        state.name = 'Vivia'
        expect(counter).toBe(2)
        state.age = 34
        expect(counter).toBe(3)
    })
})


