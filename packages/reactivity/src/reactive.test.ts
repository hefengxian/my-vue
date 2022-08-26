import {describe, expect, test} from "@jest/globals"
import {reactive} from '@myvue/reactivity'

const target = {
    name: 'Frank',
    age: 30,
}

describe('Reactive test', () => {
    test('Should be the strict equal when same target proxy multiple times', () => {
        expect(reactive(target) === reactive(target)).toBe(true)
    })

    test('Should not proxy again if already be a proxy', () => {
        const state = reactive(target)
        expect(state === reactive(state)).toBe(true)
    })
})