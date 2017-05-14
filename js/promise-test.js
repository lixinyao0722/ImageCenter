// new Promise((resolve, reject) => {
//     //resolve('p1 resolve');
//     // reject('p1 reject');
//     throw {name:'Tom',age:10};
// }).then(msg => {
//     console.log(msg);
//     return 'p2 then resolve';
// })/*.catch(e => {
//     console.log(e);
//     return 'p2 catch resolve';
// })*/.then(msg => {
//     console.log(msg);
//     return 'p3 then resolve';
// }).catch(e => {
//     console.log(e);
//     return 'p3 catch resolve';
// }).then(msg => {
//     console.log(msg);
//     return 'p4 then resolve';
// });

const p1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('p1 resolve');
        resolve({name: 'p1'});
    }, 1000);
});
const p2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('p2 resolve');
        resolve({name: 'p2'});
    }, 2000);
});

Promise.all([p1, p2]).then(res => {
    console.log(res);
}).catch(e => {
    console.log(e);
});