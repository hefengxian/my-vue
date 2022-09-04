import { describe, test, expect } from '@jest/globals'
import { computed } from './computed'
import { reactive } from './reactive'


describe('Computed Test', () => {
    test('Should run as computed', () => {
        const state = reactive({
            firstName: 'He',
            lastName: 'Frank',
        })
        let counter = 0

        const fullName = computed({
            get() {
                counter++
                return `${state.firstName}_${state.lastName}` 
            },
            set(fullName: string) {
                const namePiece = fullName.split(' ')
                state.firstName = namePiece[0]
                state.lastName = namePiece[1]
            }
        })

        expect(fullName.value).toBe('He_Frank')
        fullName.value = 'Jack Ma'
        expect(state.firstName).toBe('Jack')
        // 由于更新之后没有使用所以是不运行 getter 方法的
        expect(counter).toBe(1)
        fullName.value
        expect(counter).toBe(2)
    })
})