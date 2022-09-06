import { describe, test, expect } from '@jest/globals'
import { effect } from './effect'
import { reactive, ReactivityFlags } from './reactive'
import { proxyRefs, ref, toRef, toRefs } from './ref'


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
        const person = ref({ name: 'Frank', age: 23 })
        expect(person.value[ReactivityFlags.IS_REACTIVE]).toBe(true)
    })

    test("Should property be ref after toRef", () => {
        const person = reactive({ name: 'Frank', age: 23 })
        const name = toRef(person, 'name')

        let desc = ''
        effect(() => {
            desc = `My name is ${name.value}`
        })

        expect(desc).toBe('My name is Frank')
        name.value = 'Smith'
        expect(desc).toBe('My name is Smith')

        // 直接改原对象也可以
        person.name = 'Jerry'
        expect(desc).toBe('My name is Jerry')
    })

    test("Should deconstruct all property to ref", () => {
        const person = reactive({ name: 'Frank', age: 23 })
        let { name, age } = toRefs(person)

        let desc = ''
        effect(() => {
            desc = `${name.value} ${age.value}`
        })
        expect(desc).toBe('Frank 23')
        person.name = 'Jerry'
        expect(desc).toBe('Jerry 23')
        age.value = 30
        expect(desc).toBe('Jerry 30')
    })

    test("Should proxy togather", () => {
        const name = ref('Frank')
        const age = ref(23)
        const person = proxyRefs({name, age, gender: 'male'})
        let desc = ''
        effect(() => {
            desc = [person.name, person.age, person.gender].join(',')
        })
        expect(desc).toBe('Frank,23,male')
        name.value = 'Vivy'
        age.value = 18
        person.gender = 'female'
        // 由于 gender 不是 ref 所以不具备响应式功能
        expect(desc).toBe('Vivy,18,male')
    })
})