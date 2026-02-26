# 单词记忆小程序

网页版英语单词记忆工具，支持四册词库学习、选择题测试、三色标记、错词本和进度统计。

## 功能

- 选册学习：七上 / 七下 / 八上 / 八下
- 单词学习：展示单词、音标、词根提示（长词）
- 发音：使用 Web Speech API
- 测试：每题 4 选 1 中文释义
- 三色标记：
  - 绿色：每周复习
  - 黄色：每天复习
  - 红色：每天重点复习并进入错词本
- 错词本：查看红色词条并移出
- 进度统计：今日学习数、本周正确率、三色分布

## 数据来源

- `../七上.txt`
- `../七下.txt`
- `../八上.txt`
- `../八下.txt`

解析脚本：`parse_words.py`

重新生成词库：

```bash
cd ~/胡祖源/word-app
python3 parse_words.py
```

## 运行

```bash
cd ~/胡祖源/word-app
python3 -m http.server 8080
```

浏览器访问：`http://localhost:8080`

## 文件结构

- `index.html` 主页面
- `style.css` 样式
- `app.js` 交互逻辑
- `words.json` 单词数据
- `parse_words.py` 词库解析脚本
- `README.md` 使用说明
