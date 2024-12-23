// pages/setting/setting.js
import {addLoss,addRise} from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList:[{id:'1',title:'上涨'},{id:'2',title:'下跌'}],
    isAdd:'1',
    stockInfo:{
      cost:'',//昨天收盘价格
      postion:'100',//持股数
      earnings:'',//收益
      loss:'',//亏损
      result:'',//总金额
      dailyLimit:'',//涨停
      limitDown:'',//跌停
      percent:'10',//百分比
    }
  },
  // 输入
  onChangeRow(e){
    const type=e.currentTarget.dataset.name
    const value=e.detail.value
    let handleData=this.data.stockInfo
    // const isNumber = /^\d+$/.test(value);
    const isNumber=!isNaN(value)
    if(isNumber){
      if(type==='cost'||type==='addCost'||type==='reduceCost'){
        let str=value.split('.')[1]
        if(str&&str.length>=4){
          handleData[type]=Number(value).toFixed(4)
        }else{
            handleData[type]=value
          }
        }else if(type==='postion'){
          if(Number(value)<100){
            handleData[type]=100
          }else{
          handleData[type]=value
        }
        
      }else{
        handleData[type]=Number(value).toFixed(0)
      }
    }
    // handleData[type]=Number(value).toFixed(0)
    this.setData({
      stockInfo:handleData,
    })
  },
  // 计算
  isCalculate(){
    if(this.data.isAdd==='1'){
      let handleData=addRise(this.data.stockInfo)
      let dataHandle=this.data.stockInfo
      dataHandle.result=handleData.result
      dataHandle.earnings=handleData.resultCost
      dataHandle.loss=''
      this.setData({
        stockInfo:dataHandle
      })
    }else{
      let handleData=addLoss(this.data.stockInfo)
      let dataHandle=this.data.stockInfo
      dataHandle.result=handleData.result
      dataHandle.loss=handleData.resultCost
      dataHandle.earnings=''
      this.setData({
        stockInfo:dataHandle
      })
    }
  },
  isRest(){
    this.setData({
      stockInfo:{
        cost:'',//昨天收盘价格
        postion:'100',//持股数
        earnings:'',//收益
        loss:'',//亏损
        result:'',//总金额
        dailyLimit:'',//涨停
        limitDown:'',//跌停
        percent:'10',//百分比
      }
    })
  },
  onTab(e){
    this.setData({
      isAdd:e.currentTarget.dataset.name
    })
    let handleData=this.data.stockInfo
    handleData.limitDown=''
    handleData.dailyLimit=''
    this.setData({
      stockInfo:handleData
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})