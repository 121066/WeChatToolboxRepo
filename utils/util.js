const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 计算补仓成本
const isCostValue = (data) => {
  const { cost, position, addNum, addCost, rate } = data;

  // 计算手续费
  const fee = (addNum * addCost) * rate;

  // 计算总成本 = 原持仓成本 + 新增成本 + 手续费
  const totalCost = (cost * position) + (addNum * addCost) + fee;

  // 计算总股数
  const totalShares = position + addNum;

  // 计算新的平均成本
  const avgCost = totalCost / totalShares;

  return avgCost.toFixed(4);
};

// 计算减仓成本
const isReduceCostValue = (data) => {
  const { cost, position, addNum, reduceCost, rate } = data;
  // 转换为数字类型
  const numCost = Number(cost);
  const numPosition = Number(position);
  const numReduceNum = Number(addNum);
  const numReduceCost = Number(reduceCost);
  const numRate = Number(rate);

  if (!numCost || !numPosition || !numReduceNum || !numReduceCost || numReduceNum > numPosition) {
    return 0;
  }

  // 计算手续费
  const fee = (numReduceNum * numReduceCost) * numRate;

  // 计算卖出收入
  const sellIncome = (numReduceNum * numReduceCost) - fee;

  // 计算剩余成本 = 原总成本 - (卖出数量 * 原成本)
  const remainingCost = (numCost * numPosition) - (numReduceNum * numCost);

  // 计算新的平均成本
  const avgCost = remainingCost / (numPosition - numReduceNum);

  return avgCost.toFixed(4);
};

// 计算涨停价
const dailyLimit = (data) => {
  const { cost } = data;
  const numCost = Number(cost);

  if (!numCost) return '';

  // 涨停价计算（按10%计算）
  const limitPrice = numCost * 1.1;
  return limitPrice.toFixed(4);
};

// 计算跌停价
const limitDown = (data) => {
  const { cost } = data;
  const numCost = Number(cost);

  if (!numCost) return '';

  // 跌停价计算（按10%计算）
  const limitPrice = numCost * 0.9;
  return limitPrice.toFixed(4);
};

// 计算手续费
const calculateFee = (price, quantity, rate) => {
  const fee = price * quantity * rate;
  return fee.toFixed(4);
};

// 上涨
const addRise = ({ cost = 0, postion = 0, percent = 0 }) => {
  let result = percent === '0' ? (cost) * (postion) : (Number(cost) + Number((cost * (percent / 100)))) * postion
  let resultCost = (cost * ((percent === '0' ? '1' : percent / 100))) * postion
  return {
    result: result.toFixed(4),
    resultCost: resultCost.toFixed(4)
  }
}

// 下跌
const addLoss = ({ cost = 0, postion = 0, percent = 0 }) => {
  let result = percent === '0' ? (cost) * (postion) : (Number(cost) - Number((cost * (percent / 100)))) * postion
  let resultCost = (cost * ((percent === '0' ? '1' : percent / 100))) * postion
  return {
    result: result.toFixed(4),
    resultCost: resultCost.toFixed(4)
  }
}

const util = {
  formatTime,
  isCostValue,
  isReduceCostValue,
  dailyLimit,
  limitDown,
  addRise,
  addLoss,
  calculateFee
}

module.exports = util
