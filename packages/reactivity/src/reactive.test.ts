import { describe, expect, test } from "@jest/globals"
import { reactive, ReactivityFlags } from '@myvue/reactivity'

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

    test('Should do deep proxy', () => {
        const state = reactive({
            name: 'Frank',
            age: 30,
            address: {
                country: 'CN',
                province: 'GuanDong',
                street: {
                    road: ['AA', 'BB']
                }
            }
        })
        expect(state[ReactivityFlags.IS_REACTIVE] 
            && state.address[ReactivityFlags.IS_REACTIVE] 
            && state.address.street[ReactivityFlags.IS_REACTIVE]).toBe(true)
    })
})