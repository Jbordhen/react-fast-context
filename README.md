# react-fast-context

This create-fast-context is based on [this video](https://www.youtube.com/watch?v=ZKlXqrcBx88&t=1475s&ab_channel=JackHerrington) by Jack Herrington.

I just changed somethings for example
* access to store value inside setStore variable
* default selector is undefined
* access to getStore as the third index value

There is some typescript issues, like if selector is undefined, store value shows `unknown`, it should be `undefined`.
