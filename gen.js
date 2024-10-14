import fetch from 'node-fetch'
import * as cheerio from 'cheerio';
import path from 'path'
import fs from 'fs'

async function run() {
  let res = await fetch('https://www.v2ex.com/?tab=hot')
  let text = await res.text()
  const $ = cheerio.load(text);
  let listEl = $("div[class='cell item']");
  let list = []
  listEl.each(function () {
    let item_title = $(this).find('.topic-link')
    if (!item_title.length) return
    let item = {}
    let href = item_title[0].attribs.href
    let r = href.match(/(\d+)/)
    if (r && r[0]) {
      item.id = r[0] - 0
    }
    item.title = item_title.text()
    item.replyCount = $(this).find('.count_livid').text() - 0
    item.avatar = $(this).find('.avatar').attr('src')

    let topicInfo = $(this).find('.topic_info')
    let strongList = topicInfo.find('strong')
    item.username = $(strongList[0]).text();

    if (strongList.length > 1) {
      item.lastReplyUsername = $(strongList[1]).text();
    }

    let date = topicInfo.find('span');
    if (date.length) {
      item.lastReplyDate = date.text().replace(' +08:00', '');
    }

    let nodeEl = topicInfo.find('.node');
    if (nodeEl.length) {
      item.nodeTitle = nodeEl.text();
      item.nodeUrl = nodeEl.attr('href').replace('/go/', '');
    }
    list.push(item)
  })


  let pathName = "./public/hot/";
  if (!fs.existsSync(pathName)) {
    fs.mkdirSync(pathName)
  }

  // let pathName = "./public/hot/";
  // if (!fs.existsSync(pathName)) {
  //   fs.mkdirSync(pathName)
  // }


  const now = new Date();

  const year = now.getFullYear(); // 获取当前年份
  const month = now.getMonth() + 1; // 获取当前月份，注意月份从 0 开始，因此需要 +1
  const day = now.getDate(); // 获取当前日期
  const h = now.getHours(); // 获取当前日期
  const m = now.getMinutes(); // 获取当前日期

  fs.writeFileSync(
    pathName + `/${year}-${month}-${day}-${h}-${m}.json`,
    JSON.stringify(list, null, 2)
  );

  let files = fs.readdirSync(pathName);
  files = files.filter(v => v !== 'map.json').map(file => {
    file = file.replace('.json', '')
    return file
  });

  console.log('files', files)
  fs.writeFileSync(
    pathName + `/map.json`,
    JSON.stringify(files, null, 2)
  );
  // console.log(list)
}

run()