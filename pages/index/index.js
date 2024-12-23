// index.js
import { limitDown, dailyLimit, isCostValue, isReduceCostValue } from '../../utils/util'
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const DEFAULT_STOCK_INFO = {
  cost: 0,
  position: 100,
  addNum: 0,
  addCost: 0,
  reduceCost: 0,
  rate: 0.0025,
  result: 0,
  dailyLimit: '',
  limitDown: '',
  rateValue: 0
}
Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    isAdd: '1',
    stockInfo: {
      cost: '1',//成本
      postion: '100',//持仓数量
      addNum: '100',//补仓数量
      addCost: '1',//补仓价格,
      reduceCost: '1',//减持价格
      rate: '0.0025',//手续费
      result: '0',//最终结果
      dailyLimit: '',//涨停
      limitDown: '',//跌停
      rateValue: '',//费率金额
    },
    tabList: [{ id: '1', title: '补仓' }, { id: '2', title: '减仓' }],
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  // 计算
  isCalculate() {
    let handleData = this.data.stockInfo
    handleData.result = this.data.isAdd === '1' ? isCostValue(handleData) : isReduceCostValue(handleData)
    handleData.limitDown = limitDown(handleData)
    handleData.dailyLimit = dailyLimit(handleData)
    console.log(handleData)
    this.setData({
      stockInfo: handleData
    })
  },
  // 重置
  isRest() {
    this.setData({
      stockInfo: { ...DEFAULT_STOCK_INFO }
    })
  },
  // 输入
  onChangeRow(e) {
    const { name: type } = e.currentTarget.dataset;
    const { value } = e.detail;

    if (isNaN(value)) return;

    const handleData = { ...this.data.stockInfo };

    switch (type) {
      case 'cost':
      case 'addCost':
      case 'reduceCost':
        handleData[type] = this.formatDecimal(value, 4);
        break;
      case 'position':
        handleData[type] = Math.max(100, Number(value));
        break;
      default:
        handleData[type] = Math.floor(Number(value));
    }

    this.setData({ stockInfo: handleData });
  },
  // 新增辅助函数
  formatDecimal(value, decimals) {
    const num = Number(value);
    const parts = value.split('.');
    if (parts[1] && parts[1].length > decimals) {
      return num.toFixed(decimals);
    }
    return value;
  },
  onTab(e) {
    const handleData = {
      ...this.data.stockInfo,
      limitDown: '',
      dailyLimit: ''
    };

    this.setData({
      isAdd: e.currentTarget.dataset.name,
      stockInfo: handleData
    });
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  onQuickSelect(e) {
    const { value } = e.currentTarget.dataset;
    const handleData = { ...this.data.stockInfo };

    if (this.data.isAdd === '1') {
      handleData.addNum = value;
    } else {
      handleData.position = value;
    }

    this.setData({
      stockInfo: handleData
    });
  },
})
