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
})