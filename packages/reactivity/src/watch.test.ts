import { describe, test, expect } from '@jest/globals'
import { reactive } from './reactive'
import { watch } from './watch'



describe('Watch API tests', () => {
    test('Should run callback when reactive object properties change', () => {
        const state = reactive({
            name: 'Tom',
            address: {street: 'ABC'}
        })

        let counter = 0
        watch(state, (newVal: any, oldVal: any) => {
            counter++
            // 对象的属性变动，新旧值都是同一个引用
            expect(newVal).toBe(oldVal)
        })
        state.name = 'Jerry'
        expect(counter).toBe(1)
        state.address.street = 'BCD'
        expect(counter).toBe(2)
    })
})