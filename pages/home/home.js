// pages/home/home.js
const util = require('../../utils/util.js')

const DEFAULT_STOCK_INFO = {
  cost: '1.0000',     // 成本价格，默认1，4位小数
  position: '100',     // 持仓数量，默认100
  addNum: '',         // 加仓/减仓数量
  addCost: '1.0000',  // 加仓价格，默认1，4位小数
  reduceCost: '1.0000', // 减仓价格，默认1，4位小数
  rate: '0.0025',     // 手续费率
  result: '',         // 计算结果
  dailyLimit: '',     // 涨停价格
  limitDown: ''       // 跌停价格
}

Page({
  data: {
    isAdd: '1',
    stockInfo: { ...DEFAULT_STOCK_INFO },
    tabList: [{ id: '1', title: '补仓' }, { id: '2', title: '减仓' }],
  },

  // 计算
  isCalculate() {
    const handleData = { ...this.data.stockInfo };

    // 基础数据验证
    if (!this.validateInput(handleData)) return;

    try {
      // 转换为数字并保留4位小数
      const cost = Number(handleData.cost);        // 成本价
      const position = Number(handleData.position); // 持仓数量
      const addNum = Number(handleData.addNum);    // 加减仓数量
      const rate = Number(handleData.rate);        // 手续费率

      // 加减仓价格
      const tradePrice = this.data.isAdd === '1'
        ? Number(handleData.addCost)    // 加仓价
        : Number(handleData.reduceCost); // 减仓价

      // 计算手续费
      const fee = tradePrice * addNum * rate;

      let result;
      if (this.data.isAdd === '1') {
        // 加仓成本计算
        // 公式：(原成本×原持股 + 加仓价×加仓数 + 手续费) ÷ (原持股 + 加仓数)
        const totalCost = cost * position + tradePrice * addNum + fee;
        const totalShares = position + addNum;
        result = totalCost / totalShares;
      } else {
        // 减仓成本计算
        // 公式：(原成本×原持股 - 减仓价×减仓数 + 手续费) ÷ (原持股 - 减仓数)
        const totalCost = cost * position - tradePrice * addNum + fee;
        const totalShares = position - addNum;
        result = totalCost / totalShares;
      }

      // 确保结果为有效数字
      if (isNaN(result) || !isFinite(result)) {
        throw new Error('计算结果无效');
      }

      // 格式化结果，确保4位小数
      const formattedResult = result.toFixed(4);

      // 计算涨跌停价格
      const dailyLimit = (result * 1.1).toFixed(4);
      const limitDown = (result * 0.9).toFixed(4);

      // 更新结果
      this.setData({
        stockInfo: {
          ...handleData,
          result: formattedResult,
          dailyLimit,
          limitDown
        }
      });

    } catch (error) {
      console.error('计算错误:', error);
      // 显示具体错误信息
      wx.showToast({
        title: error.message || '计算出错，请检查输入',
        icon: 'none',
        duration: 2000
      });

      // 清空结果显示
      this.setData({
        stockInfo: {
          ...handleData,
          result: '--',
          dailyLimit: '--',
          limitDown: '--'
        }
      });
    }
  },

  // 数据验证
  validateInput(data) {
    const { cost, position, addNum } = data;
    const tradePrice = this.data.isAdd === '1' ? data.addCost : data.reduceCost;

    // 检查必填项
    if (!cost || !position || !addNum || !tradePrice) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return false;
    }

    // 检查数值有效性
    const values = [cost, position, addNum, tradePrice].map(Number);
    if (values.some(v => isNaN(v) || v <= 0)) {
      wx.showToast({
        title: '请输入有效的正数',
        icon: 'none'
      });
      return false;
    }

    // 减仓特殊验证
    if (this.data.isAdd === '2') {
      if (Number(addNum) >= Number(position)) {
        wx.showToast({
          title: '减仓数量必须小于持仓数量',
          icon: 'none'
        });
        return false;
      }
    }

    return true;
  },

  // 重置
  isRest() {
    this.setData({
      stockInfo: {
        ...DEFAULT_STOCK_INFO,
        rate: '0.0025' // 保持默认费率
      }
    });
  },

  // 输入处理
  onChangeRow(e) {
    const { name: type } = e.currentTarget.dataset;
    let { value } = e.detail;

    // 空值处理
    if (!value) {
      const handleData = { ...this.data.stockInfo };
      if (type === 'position') {
        handleData[type] = '100';  // 仅持仓数量保持默认值
      } else {
        handleData[type] = '';     // 其他字段允许为空
      }
      this.setData({ stockInfo: handleData });
      return;
    }

    const handleData = { ...this.data.stockInfo };

    switch (type) {
      case 'cost':
      case 'addCost':
      case 'reduceCost':
        // 价格输入处理
        // 1. 允许以 "." 开头
        if (value === '.') {
          handleData[type] = '0.';
          break;
        }

        // 2. 移除非法字符，只保留数字和第一个小数点
        let processed = '';
        let hasDecimal = false;
        for (let i = 0; i < value.length; i++) {
          const char = value[i];
          if (char === '.' && !hasDecimal) {
            hasDecimal = true;
            processed += char;
          } else if (/\d/.test(char)) {
            processed += char;
          }
        }

        // 3. 处理整数和小数部分
        const parts = processed.split('.');

        // 整数部分不超过6位
        if (parts[0] && parts[0].length > 6) {
          parts[0] = parts[0].slice(0, 6);
        }

        // 小数部分不超过4位
        if (parts[1] && parts[1].length > 4) {
          parts[1] = parts[1].slice(0, 4);
        }

        handleData[type] = parts.length > 1 ? `${parts[0]}.${parts[1]}` : processed;
        break;

      case 'position':
      case 'addNum':
        // 数量只允许整数
        value = value.replace(/\D/g, '').slice(0, 7);
        if (!value && type === 'position') value = '100';
        handleData[type] = value;
        break;

      case 'rate':
        // 费率处理
        if (value === '.') {
          handleData[type] = '0.';
          break;
        }

        // 处理费率输入，保持6位小数
        let rateValue = '';
        let hasRateDecimal = false;
        for (let i = 0; i < value.length; i++) {
          const char = value[i];
          if (char === '.' && !hasRateDecimal) {
            hasRateDecimal = true;
            rateValue += char;
          } else if (/\d/.test(char)) {
            rateValue += char;
          }
        }

        const rateParts = rateValue.split('.');
        if (rateParts[0] && Number(rateParts[0]) > 1) {
          rateParts[0] = '1';
        }
        if (rateParts[1] && rateParts[1].length > 6) {
          rateParts[1] = rateParts[1].slice(0, 6);
        }

        handleData[type] = rateParts.length > 1 ? `${rateParts[0]}.${rateParts[1]}` : rateValue;
        break;
    }

    this.setData({ stockInfo: handleData });
  },

  // 格式化小数
  formatDecimal(value, decimals) {
    // 移除开头的多个0
    value = value.replace(/^0+(?=\d)/, '');

    // 处理小数点
    const parts = value.split('.');
    if (parts.length > 2) return false;  // 多于一个小数点

    // 处理整数部分
    if (parts[0].length > 6) return false;  // 整数部分不超过6位
    if (parts[0] === '') parts[0] = '0';    // 处理只输入小数点的情况

    // 处理小数部分
    let decimal = parts[1] || '';
    // 补全或截取到指定小数位
    decimal = decimal.padEnd(decimals, '0').slice(0, decimals);

    return `${parts[0]}.${decimal}`;
  },

  // 切换加仓/减仓
  onTab(e) {
    const { name } = e.currentTarget.dataset;

    // 如果点击当前选中的tab，不做处理
    if (name === this.data.isAdd) return;

    // 清空相关数据
    const handleData = {
      ...this.data.stockInfo,
      addNum: '',  // 清空加仓/减仓数量
      limitDown: '',
      dailyLimit: '',
      result: '0'
    };

    this.setData({
      isAdd: name,
      stockInfo: handleData
    });
  },

  // 快捷选择数量
  onQuickSelect(e) {
    const { value } = e.currentTarget.dataset;
    const handleData = { ...this.data.stockInfo };

    if (this.data.isAdd === '1') {
      // 补仓模式：设置补仓数量
      if (value === handleData.addNum) {
        // 如果点击当前选中的数量，则清空
        handleData.addNum = '';
      } else {
        handleData.addNum = String(value);
      }

      // 自动计算
      this.setData({ stockInfo: handleData }, () => {
        // 如果其他必填项都已填写，自动触发计算
        if (handleData.cost && handleData.position && handleData.addCost) {
          this.isCalculate();
        }
      });
    } else {
      // 减仓模式：设置减仓数量，但不能超过持仓数量
      const currentPosition = Number(handleData.position) || 0;
      if (value > currentPosition) {
        wx.showToast({
          title: '减仓数量不能超过持仓数量',
          icon: 'none'
        });
        return;
      }

      if (value === Number(handleData.addNum)) {
        handleData.addNum = '';
      } else {
        handleData.addNum = String(value);
      }

      // 自动计算
      this.setData({ stockInfo: handleData }, () => {
        // 如果其他必填项都已填写，自动触发计算
        if (handleData.cost && handleData.position && handleData.reduceCost) {
          this.isCalculate();
        }
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 初始化数据
    this.setData({
      stockInfo: { ...DEFAULT_STOCK_INFO }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 可以在这里添加页面显示时的逻辑
  },
});