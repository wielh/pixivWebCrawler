# PixivWebCrawler 介紹

## 1. 這是一個怎麼樣的程式
  使用 typescript 與 node.js 做的程式，用來自動下載 [pixiv](https://www.pixiv.net/) 網站的用戶自己收藏的圖片

## 2. 使用到的相關技術
  typescript, node.js, axios, mongodb 與 mongoose
  
## 3. 如何使用本程式
 1. 下載 node.js, mongodb 與本程式
 2. 進入程式資料夾後執行 tsc 編譯程式，執行 node mongo-setting\mongo-script.js 完成 mongo 設定
 3. 使用 node main.js <參數> 執行程式，有以下參數
    - --userid {string} : pixiv帳號id
    - --cookie {string} : 登入pixiv後，開啟開發者頁面，進入頁面 https://www.pixiv.net/users/{userid}/bookmarks/artworks 後，
                          可以看到許多API的request header都帶有Cookie，將Cookie字串複製下來。
    - --search_id : 如果有此flag，代表要將作品id與一些其他資訊下載到 mongodb
    - --download : 如果有此flag，則根據在mongodb的作品id下載影像
    - --max_downloaded {int}: 如果有此flag，則只下載前{int}個id所包含的影像
