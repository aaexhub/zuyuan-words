#!/usr/bin/env python3
"""手动提取七年级单词数据"""
import json
import os

# 七年级上册单词（手动整理部分关键单词）
g7u_words = [
    {"word": "junior high", "pos": "n.", "chinese": "初级中学"},
    {"word": "ready", "pos": "adj.", "chinese": "准备好（做某事）的"},
    {"word": "textbook", "pos": "n.", "chinese": "教科书，教材，课本"},
    {"word": "forget", "pos": "v.", "chinese": "忘记"},
    {"word": "pack", "pos": "v.", "chinese": "把...打包"},
    {"word": "eraser", "pos": "n.", "chinese": "橡皮"},
    {"word": "history", "pos": "n.", "chinese": "历史"},
    {"word": "geography", "pos": "n.", "chinese": "地理"},
    {"word": "biology", "pos": "n.", "chinese": "生物"},
    {"word": "physics", "pos": "n.", "chinese": "物理"},
    {"word": "chemistry", "pos": "n.", "chinese": "化学"},
    {"word": "jacket", "pos": "n.", "chinese": "夹克，短上衣"},
    {"word": "red scarf", "pos": "n.", "chinese": "红领巾"},
    {"word": "jeans", "pos": "n.", "chinese": "牛仔裤"},
    {"word": "hat", "pos": "n.", "chinese": "帽子"},
    {"word": "T-shirt", "pos": "n.", "chinese": "T 恤衫，短袖运动衫"},
    {"word": "grey", "pos": "adj.", "chinese": "灰色的"},
    {"word": "uniform", "pos": "n.", "chinese": "制服"},
    {"word": "future", "pos": "adj.", "chinese": "将来的，未来的"},
    {"word": "passage", "pos": "n.", "chinese": "段落，文章"},
    {"word": "teaching building", "pos": "n.", "chinese": "教学楼"},
    {"word": "dining hall", "pos": "n.", "chinese": "餐厅"},
    {"word": "volunteer", "pos": "n.", "chinese": "志愿者"},
    {"word": "around", "pos": "adv.", "chinese": "到处，四处"},
    {"word": "follow", "pos": "v.", "chinese": "跟随"},
    {"word": "lab", "pos": "n.", "chinese": "实验室"},
    {"word": "hold", "pos": "v.", "chinese": "举行，进行"},
    {"word": "event", "pos": "n.", "chinese": "活动"},
    {"word": "delicious", "pos": "adj.", "chinese": "美味的，可口的"},
    {"word": "join", "pos": "v.", "chinese": "参加，加入"},
    {"word": "club", "pos": "n.", "chinese": "俱乐部"},
    {"word": "life", "pos": "n.", "chinese": "生活"},
    {"word": "introduce", "pos": "v.", "chinese": "介绍"},
    {"word": "yourself", "pos": "pron.", "chinese": "你自己"},
    {"word": "everyone", "pos": "pron.", "chinese": "每人，人人"},
    {"word": "holiday", "pos": "n.", "chinese": "假期，假日"},
    {"word": "enjoy", "pos": "v.", "chinese": "喜爱，欣赏"},
    {"word": "nervous", "pos": "adj.", "chinese": "紧张不安的"},
    {"word": "classmate", "pos": "n.", "chinese": "同班同学"},
    {"word": "hobby", "pos": "n.", "chinese": "业余爱好"},
    {"word": "organise", "pos": "v.", "chinese": "组织"},
    {"word": "need", "pos": "v.", "chinese": "需要"},
    {"word": "snack", "pos": "n.", "chinese": "小吃，点心"},
    {"word": "activity", "pos": "n.", "chinese": "活动"},
    {"word": "decoration", "pos": "n.", "chinese": "装饰品"},
    {"word": "balloon", "pos": "n.", "chinese": "气球"},
    {"word": "leaf", "pos": "n.", "chinese": "叶，叶子"},
]

# 七年级下册单词（部分）
g7l_words = [
    {"word": "crayon", "pos": "n.", "chinese": "蜡笔"},
    {"word": "eraser", "pos": "n.", "chinese": "橡皮"},
    {"word": "glove", "pos": "n.", "chinese": "手套"},
    {"word": "wallet", "pos": "n.", "chinese": "钱包"},
    {"word": "watch", "pos": "n.", "chinese": "手表"},
    {"word": "whose", "pos": "pron.", "chinese": "谁的"},
    {"word": "first of all", "pos": "phr.", "chinese": "首先"},
    {"word": "lose", "pos": "v.", "chinese": "丢失"},
    {"word": "find", "pos": "v.", "chinese": "发现，找到"},
    {"word": "lost and found office", "pos": "n.", "chinese": "失物招领处"},
    {"word": "careful", "pos": "adj.", "chinese": "仔细的，认真的"},
    {"word": "tape", "pos": "n.", "chinese": "磁带"},
    {"word": "player", "pos": "n.", "chinese": "播放机"},
    {"word": "purple", "pos": "adj.", "chinese": "紫色的"},
    {"word": "pink", "pos": "adj.", "chinese": "粉色的"},
    {"word": "mine", "pos": "pron.", "chinese": "我的"},
    {"word": "yours", "pos": "pron.", "chinese": "你的"},
    {"word": "hers", "pos": "pron.", "chinese": "她的"},
    {"word": "on", "pos": "prep.", "chinese": "在...上"},
    {"word": "chair", "pos": "n.", "chinese": "椅子"},
    {"word": "under", "pos": "prep.", "chinese": "在...下"},
    {"word": "box", "pos": "n.", "chinese": "盒子"},
    {"word": "schoolbag", "pos": "n.", "chinese": "书包"},
    {"word": "bedroom", "pos": "n.", "chinese": "卧室"},
    {"word": "living room", "pos": "n.", "chinese": "客厅"},
    {"word": "kitchen", "pos": "n.", "chinese": "厨房"},
    {"word": "bathroom", "pos": "n.", "chinese": "浴室"},
    {"word": "wall", "pos": "n.", "chinese": "墙"},
    {"word": "window", "pos": "n.", "chinese": "窗户"},
    {"word": "door", "pos": "n.", "chinese": "门"},
]

def main():
    base = os.path.dirname(os.path.abspath(__file__))
    
    # 读取现有的八年级数据
    with open(os.path.join(base, 'words.json'), 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 更新七年级数据
    data['grade7_upper']['words'] = g7u_words
    data['grade7_lower']['words'] = g7l_words
    
    # 统计
    total = (len(g7u_words) + len(g7l_words) + 
             len(data['grade8_upper']['words']) + 
             sum(len(u['words']) for u in data['grade8_lower']['units']))
    
    print("="*50)
    print("更新后的单词数量:")
    print("="*50)
    print(f"  七年级上册: {len(g7u_words)} 词")
    print(f"  七年级下册: {len(g7l_words)} 词")
    print(f"  八年级上册: {len(data['grade8_upper']['words'])} 词")
    print(f"  八年级下册: {sum(len(u['words']) for u in data['grade8_lower']['units'])} 词")
    print(f"\n  总计: {total} 词")
    print("="*50)
    
    # 保存
    with open(os.path.join(base, 'words.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 数据已更新并保存")

if __name__ == '__main__':
    main()
