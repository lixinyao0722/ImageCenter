const nums = [1, 3, 5, 7, 9];
const squarts = nums.map(num => num * num);
const total = nums.reduce((prevVal, curNum) => prevVal + curNum);
const gt5Nums = nums.filter(num => num > 5);

console.log({nums, squarts, total, gt5Nums});
