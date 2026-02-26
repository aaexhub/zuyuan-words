#!/usr/bin/env python3
"""解析七年级单词 - 特殊格式"""
import re
import json
import os

def parse_grade7_v2(text):
    """解析七年级 - 特殊两列格式"""
    words = []
    seen = set()
    
    for line in text.split('\n'):
        # 每行可能有两个单词，格式: "1. word1 pos1 chinese1  20. word2 pos2 chinese2"
        # 分割成两列处理
        
        # 方法1：匹配"数字. 单词 词性 中文"的模式
        pattern = r'(\d+)\.\s+([a-zA-Z][a-zA-Z\s\-]{1,35}?)\s+(n\.|v\.|adj\.|adv\.|pron\.|prep\.|conj\.|num\.)\s+([\u4e00-\u9fff][^\d]+?)(?=\s+\d+\.|$)'
        
        matches = list(re.finditer(pattern, line))
        
        for match in matches:
            num = match.group(1)
            word = match.group(2).strip()
            pos = match.group(3)
            chinese = match.group(4).strip()
            
            # 去重和过滤
            if word in seen:
                continue
            if not word or len(word) < 2:
                continue
            if not chinese or not re.search(r'[\u4e00-\u9fff]', chinese):
                continue
            if len(word.split()) > 4:  # 过滤掉太长的
                continue
            
            seen.add(word)
            words.append({
                "word": word,
                "pos": pos,
                "chinese": chinese
            })
    
    return words

def parse_grade8_upper_v2(text):
    """解析八年级上册"""
    words = []
    seen = set()
    
    for line in text.split('\n'):
        line = line.strip()
        # 格式: 1. suppose /səˈpəʊz/ v.假设，认为
        match = re.match(
            r'^(\d+)\.\s+([a-zA-Z][a-zA-Z\-]*)\s+(/[^\s/]+/)\s*(n\.|v\.|adj\.|adv\.|pron\.|prep\.|conj\.|num\.)?\s*([\u4e00-\u9fff].*?)\s*$',
            line
        )
        if match:
            word = match.group(2)
            phonetic = match.group(3)
            pos = match.group(4) or ""
            chinese = match.group(5).strip()[:80]
            
            if word and chinese and word not in seen:
                seen.add(word)
                words.append({
                    "word": word,
                    "phonetic": phonetic,
                    "pos": pos,
                    "chinese": chinese
                })
    
    return words

def parse_grade8_lower_v2(text):
    """解析八年级下册"""
    units = []
    seen_global = set()
    
    lines = text.split('\n')
    current_unit = None
    unit_words = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Unit标题
        unit_match = re.match(r'^Unit\s*(\d+)$', stripped, re.IGNORECASE)
        if unit_match:
            if current_unit is not None and unit_words:
                units.append({
                    "unit": current_unit,
                    "name": f"Unit {current_unit}",
                    "words": unit_words[:]
                })
                unit_words = []
            current_unit = int(unit_match.group(1))
            i += 1
            continue
        
        # 单词行: 数字 单词 词性 中文
        word_match = re.match(r'^\s*(\d+)\s+([a-zA-Z][a-zA-Z\-]*)\s+(n\.|v\.|adj\.|adv\.|pron\.|prep\.|conj\.|num\.)\s+(.+)$', line)
        if word_match and current_unit is not None:
            word = word_match.group(2)
            pos = word_match.group(3)
            chinese = word_match.group(4).strip()
            
            # 获取音标
            phonetic = ""
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                phonetic_match = re.match(r'^(/[^\n]+/)', next_line)
                if phonetic_match:
                    phonetic = phonetic_match.group(1)
            
            chinese = chinese.split('\t')[0].strip()[:60]
            
            # 全局去重
            word_key = f"{word}"
            if word_key not in seen_global:
                if word and chinese and re.search(r'[\u4e00-\u9fff]', chinese) and len(word) > 1:
                    seen_global.add(word_key)
                    unit_words.append({
                        "word": word,
                        "phonetic": phonetic,
                        "pos": pos,
                        "chinese": chinese
                    })
        
        i += 1
    
    # 最后一个Unit
    if current_unit is not None and unit_words:
        units.append({
            "unit": current_unit,
            "name": f"Unit {current_unit}",
            "words": unit_words
        })
    
    return units

def main():
    base = os.path.dirname(os.path.abspath(__file__))
    
    print("读取文件...")
    with open(os.path.join(base, '../七上.txt'), 'r', encoding='utf-8') as f:
        g7u_text = f.read()
    with open(os.path.join(base, '../七下.txt'), 'r', encoding='utf-8') as f:
        g7l_text = f.read()
    with open(os.path.join(base, '../八上.txt'), 'r', encoding='utf-8') as f:
        g8u_text = f.read()
    with open(os.path.join(base, '../八下.txt'), 'r', encoding='utf-8') as f:
        g8l_text = f.read()
    
    print("解析单词...")
    g7u_words = parse_grade7_v2(g7u_text)
    g7l_words = parse_grade7_v2(g7l_text)
    g8u_words = parse_grade8_upper_v2(g8u_text)
    g8l_units = parse_grade8_lower_v2(g8l_text)
    g8l_total = sum(len(u['words']) for u in g8l_units)
    
    data = {
        "grade7_upper": {
            "name": "七年级上册",
            "hasUnits": False,
            "words": g7u_words
        },
        "grade7_lower": {
            "name": "七年级下册",
            "hasUnits": False,
            "words": g7l_words
        },
        "grade8_upper": {
            "name": "八年级上册",
            "hasUnits": False,
            "words": g8u_words
        },
        "grade8_lower": {
            "name": "八年级下册",
            "hasUnits": True,
            "units": g8l_units,
            "words": []
        }
    }
    
    total = len(g7u_words) + len(g7l_words) + len(g8u_words) + g8l_total
    print("\n" + "="*50)
    print("单词解析结果:")
    print("="*50)
    print(f"  七年级上册: {len(g7u_words)} 词")
    print(f"  七年级下册: {len(g7l_words)} 词")
    print(f"  八年级上册: {len(g8u_words)} 词")
    print(f"  八年级下册: {g8l_total} 词 ({len(g8l_units)} 个Unit)")
    print(f"\n  总计: {total} 词")
    print("="*50)
    
    # 显示前几个单词作为示例
    if g7u_words:
        print("\n七年级上册示例:")
        for w in g7u_words[:5]:
            print(f"  {w['word']} {w['pos']} {w['chinese']}")
    
    # 保存
    with open(os.path.join(base, 'words.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 数据已保存")

if __name__ == '__main__':
    main()
