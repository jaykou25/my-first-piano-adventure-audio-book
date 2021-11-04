// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const { epId } = event
  const res = await db.collection('tracks').where({epId: epId}).orderBy('sort', 'asc').limit(200).get()
  return res
}