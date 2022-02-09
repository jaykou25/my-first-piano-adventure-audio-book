// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  // env: "production-7gsiba627ae3573c",
});

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const { epId, current = 1, limit = 20} = event;
  const countResult = await db
    .collection("tracks")
    .where({ epId: epId })
    .count();
  const total = countResult.total;

  const res = await db
    .collection("tracks")
    .where({ epId: epId })
    .orderBy("sort", "asc")
    .limit(limit)
    .skip((current - 1) * limit)
    .get();
  return { data: res.data, total: total };
};
