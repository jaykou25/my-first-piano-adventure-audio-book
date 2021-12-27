// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env: "production-7gsiba627ae3573c",
});

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();

  const res = await db
    .collection("eps")
    .where({})
    .orderBy("sort", "asc")
    .limit(100)
    .get();

  return res;
};
