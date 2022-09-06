import { describe, test, expect } from '@jest/globals'
import { effect } from './effect'
import { ReactivityFlags } from './reactive'
import { ref } from './ref'


describe('Ref testing', () => {
    test("Should ref is act like reactive", () => {
        const name = ref('Frank')

        let counter = 0
        let desc = ''
        effect(() => {
            counter++
            desc = `My name is ${name.value}`
        })
        expect(counter).toBe(1)
        expect(desc).toBe('My name is Frank')

        name.value = 'Vivy'
        expect(counter).toBe(2)
        expect(desc).toBe('My name is Vivy')
    })

    test("Should be a proxy when target is an object", () => {
        const person = ref({name: 'Frank', age: 23})
        expect(person.value[ReactivityFlags.IS_REACTIVE]).toBe(true)
    })
})